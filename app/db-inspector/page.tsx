import { inspectDatabase } from "@/lib/db-inspector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DbInspectorPage() {
  const result = await inspectDatabase()

  if (!result.success) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Database Inspector</h1>
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <h3 className="font-bold">Error</h3>
          <p>{result.error?.message || "An error occurred while inspecting the database"}</p>
        </div>
      </div>
    )
  }

  const { tables, functions } = result

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Database Inspector</h1>

      <Tabs defaultValue="tables">
        <TabsList className="mb-4">
          <TabsTrigger value="tables">Tables ({tables.length})</TabsTrigger>
          <TabsTrigger value="functions">Functions ({functions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tables">
          <div className="grid gap-4">
            {tables.map((table) => (
              <Card key={table.name}>
                <CardHeader>
                  <CardTitle>{table.name}</CardTitle>
                  <CardDescription>
                    {table.columns.length} columns, {table.policies.length} policies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="columns">
                      <AccordionTrigger>Columns</AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted">
                                <th className="text-left p-2 border">Name</th>
                                <th className="text-left p-2 border">Type</th>
                                <th className="text-left p-2 border">Nullable</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns.map((column, i) => (
                                <tr key={i} className="border-b">
                                  <td className="p-2 border">{column.name}</td>
                                  <td className="p-2 border">{column.data_type}</td>
                                  <td className="p-2 border">{column.is_nullable}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="policies">
                      <AccordionTrigger>Policies</AccordionTrigger>
                      <AccordionContent>
                        {table.policies.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-muted">
                                  <th className="text-left p-2 border">Name</th>
                                  <th className="text-left p-2 border">Command</th>
                                  <th className="text-left p-2 border">Roles</th>
                                  <th className="text-left p-2 border">Using</th>
                                  <th className="text-left p-2 border">With Check</th>
                                </tr>
                              </thead>
                              <tbody>
                                {table.policies.map((policy, i) => (
                                  <tr key={i} className="border-b">
                                    <td className="p-2 border">{policy.policyname}</td>
                                    <td className="p-2 border">{policy.cmd}</td>
                                    <td className="p-2 border">{policy.roles.join(", ")}</td>
                                    <td className="p-2 border whitespace-pre-wrap break-words max-w-xs">
                                      {policy.qual}
                                    </td>
                                    <td className="p-2 border whitespace-pre-wrap break-words max-w-xs">
                                      {policy.with_check || "N/A"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No policies defined for this table</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="functions">
          <div className="grid gap-4">
            {functions.map((func, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>
                    {func.name}({func.argument_types})
                  </CardTitle>
                  <CardDescription>Returns {func.return_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto">
                    <pre className="whitespace-pre-wrap text-sm">{func.definition}</pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
