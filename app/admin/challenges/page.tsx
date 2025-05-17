import { createServerSupabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: { featured?: string; page?: string }
}) {
  const supabase = createServerSupabase()
  const featured = searchParams.featured === "true"
  const page = Number.parseInt(searchParams.page || "1")
  const pageSize = 10

  // Build query
  let query = supabase
    .from("challenges")
    .select(
      `
      *,
      products:product_id (name, image_url)
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })

  // Apply featured filter
  if (searchParams.featured === "true") {
    query = query.eq("is_featured", true)
  }

  // Get total count for pagination
  const { count } = await query.select("id", { count: "exact", head: true })

  // Apply pagination
  const { data: challenges } = await query.range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Challenges</h1>
        <Link href="/admin/challenges/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Challenge
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <Link
          href="/admin/challenges"
          className={`px-3 py-2 rounded-md ${!featured ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          All Challenges
        </Link>
        <Link
          href="/admin/challenges?featured=true"
          className={`px-3 py-2 rounded-md ${featured ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Featured Challenges
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges?.map((challenge) => (
          <div key={challenge.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img
                src={
                  challenge.image_url ||
                  challenge.products?.image_url ||
                  "/placeholder.svg?height=200&width=400&query=challenge"
                }
                alt={challenge.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{challenge.title}</h3>
                <span className="text-green-600 font-bold">{challenge.duration} days</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{challenge.description}</p>
              <div className="flex justify-between items-center mt-4">
                {challenge.is_featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Featured</span>
                )}
                <div className="flex gap-2 ml-auto">
                  <Link href={`/admin/challenges/${challenge.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/challenges/${challenge.id}/edit`}>
                    <Button size="sm">Edit</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, count || 0)} of {count} results
          </div>
          <div className="flex gap-2">
            <Link href={`/admin/challenges?featured=${featured}&page=${page - 1}`} passHref>
              <Button variant="outline" disabled={page <= 1}>
                Previous
              </Button>
            </Link>
            <Link href={`/admin/challenges?featured=${featured}&page=${page + 1}`} passHref>
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
