"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, Clock, ArrowRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllChallenges } from "@/data/challenges"

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const allChallenges = getAllChallenges()

  const filteredChallenges =
    activeTab === "all"
      ? allChallenges
      : allChallenges.filter((challenge) => {
          if (activeTab === "beginner") return challenge.duration <= 7
          if (activeTab === "intermediate") return challenge.duration > 7 && challenge.duration <= 21
          if (activeTab === "advanced") return challenge.duration > 21
          return true
        })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-accent/30 py-16">
        <div className="container px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Wheatgrass Challenges</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your health with our structured wheatgrass juice challenges. Consistency is key to experiencing
              the full benefits of nature's superfood.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="mb-12">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Challenges</TabsTrigger>
                <TabsTrigger value="beginner">Beginner</TabsTrigger>
                <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden h-full glass-card">
                  <div className="aspect-video relative">
                    <Image
                      src={challenge.image || "/placeholder.svg"}
                      alt={challenge.title}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-primary">{challenge.duration} Days</Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{challenge.duration} days</span>
                      <span className="mx-2">•</span>
                      <Trophy className="h-4 w-4 mr-1" />
                      <span>
                        {challenge.duration <= 7 ? "Beginner" : challenge.duration <= 21 ? "Intermediate" : "Advanced"}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{challenge.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium">Benefits:</h4>
                      <ul className="space-y-1">
                        {challenge.benefits.slice(0, 3).map((benefit, i) => (
                          <li key={i} className="flex items-center text-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                            {benefit}
                          </li>
                        ))}
                        {challenge.benefits.length > 3 && (
                          <li className="text-sm text-muted-foreground">+ {challenge.benefits.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0">
                    <Button className="w-full" asChild>
                      <Link href={`/challenges/${challenge.slug}`}>
                        View Challenge
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Take a Challenge Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Take a Wheatgrass Challenge?</h2>
            <p className="text-muted-foreground">
              Consistency is key to experiencing the full benefits of wheatgrass. Our structured challenges help you
              establish a healthy habit while maximizing results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Structured Approach</h3>
                <p className="text-muted-foreground">
                  Our challenges provide a clear framework with daily guidance, making it easy to stay consistent and
                  track your progress.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Measurable Results</h3>
                <p className="text-muted-foreground">
                  By committing to a specific timeframe, you'll be able to clearly observe and measure the health
                  benefits you experience.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Habit Formation</h3>
                <p className="text-muted-foreground">
                  It takes 21-30 days to form a habit. Our challenges are designed to help you integrate wheatgrass into
                  your daily routine permanently.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Health?</h2>
            <p className="mb-8 text-muted-foreground">
              Choose a challenge that fits your goals and experience the full power of consistent wheatgrass
              consumption.
            </p>
            <Button size="lg" className="rounded-full">
              <Link href="#challenges">Browse Challenges</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
