"use client"

import { createServerSupabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { role?: string; search?: string; page?: string }
}) {
  const supabase = createServerSupabase()
  const role = searchParams.role || "all"
  const search = searchParams.search || ""
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 10

  // Build query
  let query = supabase.from("profiles").select("*", { count: "exact" }).order("created_at", { ascending: false })

  // Apply filters
  if (role !== "all") {
    query = query.eq("role", role)
  }

  if (search) {
    query = query.ilike("full_name", `%${search}%`)
  }

  // Get total count for pagination
  const { count } = await query.select("id", { count: "exact", head: true })

  // Apply pagination
  const { data: users } = await query.range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex gap-4">
          <form className="flex gap-2">
            <Input type="text" name="search" placeholder="Search users..." defaultValue={search} className="w-64" />
            <Button type="submit">Search</Button>
          </form>
          <select
            name="role"
            defaultValue={role}
            className="px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => {
              window.location.href = `/admin/users?role=${e.target.value}`
            }}
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.avatar_url || "/placeholder.svg?height=40&width=40&query=user"}
                        alt={user.full_name || "User"}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.full_name || "Unnamed User"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}
                  >
                    {user.role || "user"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button size="sm">Edit</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, count || 0)} of {count} results
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/users?role=${role}&search=${search}&page=${page - 1}`} passHref>
              <Button variant="outline" disabled={page <= 1}>
                Previous
              </Button>
            </Link>
            <Link href={`/admin/users?role=${role}&search=${search}&page=${page + 1}`} passHref>
              <Button variant="outline" disabled={page >= totalPages}>
                Next
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
