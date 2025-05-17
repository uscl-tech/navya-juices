"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newChallenge, setNewChallenge] = useState({
    name: "",
    description: "",
    duration_days: "7",
    image_url: "",
    slug: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchChallenges()
  }, [])

  async function fetchChallenges() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("challenges").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setChallenges(data || [])
    } catch (err) {
      console.error("Error fetching challenges:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      setSuccessMessage("")

      // Create slug if not provided
      const challengeToSubmit = { ...newChallenge }
      if (!challengeToSubmit.slug) {
        challengeToSubmit.slug = challengeToSubmit.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, "")
          .replace(/\s+/g, "-")
      }

      // Convert duration to number
      challengeToSubmit.duration_days = Number.parseInt(challengeToSubmit.duration_days)

      const { data, error } = await supabase.from("challenges").insert([challengeToSubmit]).select()

      if (error) throw error

      setSuccessMessage("Challenge created successfully!")
      setNewChallenge({
        name: "",
        description: "",
        duration_days: "7",
        image_url: "",
        slug: "",
      })

      // Refresh challenges list
      fetchChallenges()
    } catch (err) {
      console.error("Error creating challenge:", err)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteChallenge(id) {
    if (!confirm("Are you sure you want to delete this challenge?")) return

    try {
      setLoading(true)
      const { error } = await supabase.from("challenges").delete().eq("id", id)

      if (error) throw error

      // Refresh challenges list
      fetchChallenges()
      setSuccessMessage("Challenge deleted successfully!")
    } catch (err) {
      console.error("Error deleting challenge:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target
    setNewChallenge((prev) => ({ ...prev, [name]: value }))
  }

  if (loading && challenges.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Loading Challenges...</h1>
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white shadow rounded-lg mb-6 p-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-green-600">Manage Challenges</h1>
            <p className="text-gray-500">Add, edit, and delete challenges</p>
          </div>
          <Button asChild>
            <Link href="/admin-direct">Back to Dashboard</Link>
          </Button>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>{successMessage}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setSuccessMessage("")}>
              Dismiss
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Challenges List</CardTitle>
              </CardHeader>
              <CardContent>
                {challenges.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">ID</th>
                          <th className="text-left py-2">Name</th>
                          <th className="text-left py-2">Duration</th>
                          <th className="text-left py-2">Participants</th>
                          <th className="text-left py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {challenges.map((challenge) => (
                          <tr key={challenge.id} className="border-b">
                            <td className="py-2">{challenge.id}</td>
                            <td className="py-2">{challenge.name}</td>
                            <td className="py-2">{challenge.duration_days} days</td>
                            <td className="py-2">{challenge.participant_count || 0}</td>
                            <td className="py-2">
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/admin-direct/challenges/${challenge.id}`}>Edit</Link>
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteChallenge(challenge.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No challenges found</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Add New Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Challenge Name</Label>
                    <Input id="name" name="name" value={newChallenge.name} onChange={handleInputChange} required />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newChallenge.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration_days">Duration (days)</Label>
                    <Input
                      id="duration_days"
                      name="duration_days"
                      type="number"
                      value={newChallenge.duration_days}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      value={newChallenge.image_url}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug (optional)</Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={newChallenge.slug}
                      onChange={handleInputChange}
                      placeholder="auto-generated-if-empty"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Challenge"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
