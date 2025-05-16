"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckCircle, Clock, Trophy, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
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

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [userChallenge, setUserChallenge] = useState<UserChallenge | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const challenges = getAllChallenges()
  const supabase = getSupabase()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/account/challenges/" + params.id)
    }
  }, [user, authLoading, router, params.id])

  useEffect(() => {
    const fetchUserChallenge = async () => {
      if (!user) return

      setIsLoading(true)

      try {
        // This is a mock implementation since we don't have the actual table yet
        // In a real implementation, we would fetch from the user_challenges table

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data - in a real app, this would come from Supabase
        if (params.id === "1") {
          setUserChallenge({
            id: "1",
            user_id: user.id,
            challenge_id: 1, // 7-Day Starter Challenge
            start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            current_day: 4,
            completed_days: [1, 2, 3],
            status: "active",
          })
        } else if (params.id === "2") {
          setUserChallenge({
            id: "2",
            user_id: user.id,
            challenge_id: 2, // 21-Day Transformation
            start_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
            current_day: 21,
            completed_days: Array.from({ length: 21 }, (_, i) => i + 1),
            status: "completed",
          })
        } else {
          router.push("/account/challenges")
        }
      } catch (error) {
        console.error("Error fetching user challenge:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserChallenge()
  }, [user, params.id, router])

  const challenge = userChallenge ? challenges.find((c) => c.id === userChallenge.challenge_id) : null

  const getProgress = () => {
    if (!userChallenge || !challenge) return 0
    return Math.round((userChallenge.completed_days.length / challenge.duration) * 100)
  }

  const getDaysLeft = () => {
    if (!userChallenge || !challenge) return 0
    return challenge.duration - userChallenge.completed_days.length
  }

  const handleCheckIn = async () => {
    if (!userChallenge || !challenge || userChallenge.status !== "active") return

    setIsCheckingIn(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the user challenge
      const updatedChallenge = {
        ...userChallenge,
        current_day: userChallenge.current_day + 1,
        completed_days: [...userChallenge.completed_days, userChallenge.current_day],
      }

      // Check if challenge is completed
      if (updatedChallenge.completed_days.length >= challenge.duration) {
        updatedChallenge.status = "completed"
      }

      setUserChallenge(updatedChallenge)
    } catch (error) {
      console.error("Error checking in:", error)
    } finally {
      setIsCheckingIn(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!user || !userChallenge || !challenge) {
    return null // Will redirect in useEffect
  }

  const progress = getProgress()
  const daysLeft = getDaysLeft()
  const startDate = new Date(userChallenge.start_date)
  const isCompletedToday = userChallenge.completed_days.includes(userChallenge.current_day)

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push("/account/challenges")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Challenges
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card className="mb-8">
              <div className="relative aspect-video">
                <Image
                  src={challenge.image || "/placeholder.svg"}
                  alt={challenge.title}
                  fill
                  className="object-cover"
                />
                {userChallenge.status === "completed" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white rounded-full p-4">
                      <Trophy className="h-12 w-12 text-amber-500" />
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{challenge.title}</h1>
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
                      <span>
                        Completed on{" "}
                        {new Date(
                          startDate.getTime() + (challenge.duration - 1) * 24 * 60 * 60 * 1000,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm mt-2">
                    <span>{userChallenge.completed_days.length} days completed</span>
                    {userChallenge.status === "active" && <span>{daysLeft} days remaining</span>}
                  </div>
                </div>

                {userChallenge.status === "active" && (
                  <div className="bg-accent/30 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Today's Tip - Day {userChallenge.current_day}</h2>
                    <p className="mb-6">
                      {challenge.dailyTips.find((tip) => tip.day === userChallenge.current_day)?.tip ||
                        "Take your wheatgrass shot first thing in the morning on an empty stomach for maximum absorption."}
                    </p>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckIn}
                      disabled={isCheckingIn || isCompletedToday}
                    >
                      {isCheckingIn
                        ? "Checking In..."
                        : isCompletedToday
                          ? "Already Checked In Today"
                          : "Check In for Today"}
                    </Button>
                  </div>
                )}

                {userChallenge.status === "completed" && (
                  <div className="bg-green-50 rounded-lg p-6 mb-6 text-center">
                    <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Challenge Completed!</h2>
                    <p className="text-muted-foreground mb-4">
                      Congratulations on completing the {challenge.title}! You've taken a significant step toward better
                      health.
                    </p>
                    <Button asChild>
                      <Link href="/challenges">Explore More Challenges</Link>
                    </Button>
                  </div>
                )}

                <Separator className="my-6" />

                <div>
                  <h2 className="text-xl font-bold mb-4">Challenge Calendar</h2>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: challenge.duration }, (_, i) => i + 1).map((day) => {
                      const isCompleted = userChallenge.completed_days.includes(day)
                      const isCurrent = day === userChallenge.current_day
                      const isPast = day < userChallenge.current_day
                      const isFuture = day > userChallenge.current_day

                      return (
                        <div
                          key={day}
                          className={`aspect-square rounded-md flex items-center justify-center text-sm font-medium ${
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : isCurrent
                                ? "bg-amber-100 text-amber-800 border-2 border-amber-500"
                                : isPast
                                  ? "bg-red-100 text-red-800"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span>{day}</span>
                            {isCompleted && <CheckCircle className="h-3 w-3 mt-1" />}
                            {isPast && !isCompleted && <X className="h-3 w-3 mt-1" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expected Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20"></div>
                  <div className="space-y-6">
                    {challenge.expectedResults.map((result) => {
                      const isReached = userChallenge.completed_days.length >= result.day

                      return (
                        <div key={result.day} className="relative pl-10">
                          <div
                            className={`absolute left-0 top-0 rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium ${
                              isReached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {result.day}
                          </div>
                          <Card className={isReached ? "border-primary" : ""}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <p>{result.result}</p>
                                {isReached && <CheckCircle className="h-5 w-5 text-primary ml-2 shrink-0" />}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Challenge Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{userChallenge.status === "active" ? "Active" : "Completed"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{startDate.toLocaleDateString()}</p>
                </div>
                {userChallenge.status === "active" ? (
                  <div>
                    <p className="text-sm text-muted-foreground">Current Day</p>
                    <p className="font-medium">
                      Day {userChallenge.current_day} of {challenge.duration}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Date</p>
                    <p className="font-medium">
                      {new Date(
                        startDate.getTime() + (challenge.duration - 1) * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="font-medium">{progress}% Complete</p>
                </div>
              </CardContent>
              <CardFooter>
                {userChallenge.status === "active" ? (
                  <Button className="w-full" onClick={handleCheckIn} disabled={isCheckingIn || isCompletedToday}>
                    {isCheckingIn ? "Checking In..." : isCompletedToday ? "Already Checked In" : "Check In for Today"}
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href="/challenges">Explore More Challenges</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
