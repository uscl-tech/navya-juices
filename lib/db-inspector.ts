"use server"

import { createServerSupabase } from "./supabase"

type TableInfo = {
  name: string
  columns: {
    name: string
    data_type: string
    is_nullable: string
  }[]
  policies: {
    policyname: string
    permissive: string
    roles: string[]
    cmd: string
    qual: string
    with_check: string | null
  }[]
}

type FunctionInfo = {
  name: string
  argument_types: string
  return_type: string
  definition: string
}

export async function inspectDatabase() {
  const supabase = createServerSupabase()

  try {
    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    const { data: tables, error: tablesError } = await supabase.rpc("pgclient", { query: tablesQuery })

    if (tablesError) {
      console.error("Error fetching tables:", tablesError)
      return { success: false, error: tablesError }
    }

    const tableInfos: TableInfo[] = []

    // For each table, get columns and policies
    for (const table of tables.rows) {
      const tableName = table.table_name

      // Get columns
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
      const { data: columns, error: columnsError } = await supabase.rpc("pgclient", { query: columnsQuery })

      if (columnsError) {
        console.error(`Error fetching columns for table ${tableName}:`, columnsError)
        continue
      }

      // Get policies
      const policiesQuery = `
        SELECT policyname, permissive, roles, cmd, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = '${tableName}';
      `
      const { data: policies, error: policiesError } = await supabase.rpc("pgclient", { query: policiesQuery })

      if (policiesError) {
        console.error(`Error fetching policies for table ${tableName}:`, policiesError)
        continue
      }

      tableInfos.push({
        name: tableName,
        columns: columns.rows,
        policies: policies.rows,
      })
    }

    // Get functions
    const functionsQuery = `
      SELECT 
        p.proname AS name,
        pg_get_function_arguments(p.oid) AS argument_types,
        pg_get_function_result(p.oid) AS return_type,
        pg_get_functiondef(p.oid) AS definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public'
      ORDER BY p.proname;
    `
    const { data: functions, error: functionsError } = await supabase.rpc("pgclient", { query: functionsQuery })

    if (functionsError) {
      console.error("Error fetching functions:", functionsError)
      return { success: false, error: functionsError }
    }

    return {
      success: true,
      tables: tableInfos,
      functions: functions.rows,
    }
  } catch (error) {
    console.error("Error in inspectDatabase:", error)
    return { success: false, error }
  }
}
