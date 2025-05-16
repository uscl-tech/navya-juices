"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Trophy, Calendar, CheckCircle, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { getSupabase } from "@/lib/supabase"
import { getAllChallenges } from "@/data/challenges"

type UserChallenge = {
  id: string
  user_id: string
  challenge_id: number
  start_date: string
  current_day: number
  completed_days: number[]
  status: "active" | "completed" | "abandoned"
}

export default function MyChallengesPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const challenges = getAllChallenges()
  const supabase = getSupabase()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account/challenges")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchUserChallenges = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // This is a mock implementation since we don't have the actual table yet
        // In a real implementation, we would fetch from the user_challenges table

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data - in a real app, this would come from Supabase
        const mockChallenges: UserChallenge[] = [
          {
            id: "1",
            user_id: user.id,
            challenge_id: 1, // 7-Day Starter Challenge
            start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            current_day: 4,
            completed_days: [1, 2, 3],
            status: "active",
          },
          {
            id: "2",
            user_id: user.id,
            challenge_id: 2, // 21-Day Transformation
            start_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
            current_day: 21,
            completed_days: Array.from({ length: 21 }, (_, i) => i + 1),
            status: "completed",
          },
        ]

        setUserChallenges(mockChallenges)
      } catch (error) {
        console.error("Error fetching user challenges:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserChallenges()
  }, [user])

  const getChallenge = (challengeId: number) => {
    return challenges.find((c) => c.id === challengeId)
  }

  const getProgress = (userChallenge: UserChallenge) => {
    const challenge = getChallenge(userChallenge.challenge_id)
    if (!challenge) return 0
    return Math.round((userChallenge.completed_days.length / challenge.duration) * 100)
  }

  const getDaysLeft = (userChallenge: UserChallenge) => {
    const challenge = getChallenge(userChallenge.challenge_id)
    if (!challenge) return 0
    return challenge.duration - userChallenge.completed_days.length
  }

  const filteredChallenges = userChallenges.filter((uc) => {
    if (activeTab === "active") return uc.status === "active"
    if (activeTab === "completed") return uc.status === "completed"
    return true
  })

  if (authLoading || isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Challenges</h1>
          <Button variant="outline" onClick={() => router.push("/account")}>
            Back to Account
          </Button>
        </div>

        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Challenges</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Challenges</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredChallenges.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {activeTab === "active"
                  ? "You don't have any active challenges."
                  : activeTab === "completed"
                    ? "You haven't completed any challenges yet."
                    : "You haven't joined any challenges yet."}
              </p>
              <Button asChild>
                <Link href="/challenges">Browse Challenges</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredChallenges.map((userChallenge) => {
              const challenge = getChallenge(userChallenge.challenge_id)
              if (!challenge) return null

              const progress = getProgress(userChallenge)
              const daysLeft = getDaysLeft(userChallenge)
              const startDate = new Date(userChallenge.start_date)

              return (
                <Card key={userChallenge.id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="relative w-full md:w-48 h-48 md:h-auto">
                      <Image
                        src={challenge.image || "/placeholder.svg"}
                        alt={challenge.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                        <div>
                          <h2 className="text-xl font-bold">{challenge.title}</h2>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Started on {startDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                        {userChallenge.status === "active" ? (
                          <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                            <Clock className="h-4 w-4" />
                            <span>
                              Day {userChallenge.current_day} of {challenge.duration}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-sm">
                          {userChallenge.status === "active" ? (
                            <span>{daysLeft} days remaining</span>
                          ) : (
                            <span>Completed all {challenge.duration} days</span>
                          )}
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/account/challenges/${userChallenge.id}`}>
                            {userChallenge.status === "active" ? "Continue Challenge" : "View Details"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Recommended Challenges</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {challenges
              .filter((c) => !userChallenges.some((uc) => uc.challenge_id === c.id))
              .slice(0, 2)
              .map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Image
                      src={challenge.image || "/placeholder.svg"}
                      alt={challenge.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-4">{challenge.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{challenge.duration} days</span>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button className="w-full" asChild>
                      <Link href={`/challenges/${challenge.slug}`}>View Challenge</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
