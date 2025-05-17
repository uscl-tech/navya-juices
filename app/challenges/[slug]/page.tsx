"use client"

import { useState } from "react"
import { notFound, useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, Trophy, CheckCircle, ShoppingCart, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getChallengeBySlug } from "@/data/challenges"
import { getProductById } from "@/data/products"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

export default function ChallengePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const challenge = getChallengeBySlug(params.slug)
  const product = challenge ? getProductById(challenge.productId) : null
  const { addItem } = useCart()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  if (!challenge || !product) {
    notFound()
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  const handleJoinChallenge = () => {
    if (!user) {
      router.push(`/login?redirect=/challenges/${challenge.slug}`)
      return
    }

    // Add to cart and then redirect to checkout
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    router.push("/checkout")
  }

  return (
    <div className="container py-8 md:py-12">
      <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Challenges
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-lg mb-6">
            <Image
              src={challenge.image || "/placeholder.svg"}
              alt={challenge.title}
              fill
              className="object-cover"
              priority
            />
            <Badge className="absolute top-4 right-4 bg-primary">{challenge.duration} Days</Badge>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4 mr-1" />
              <span>{challenge.duration} days</span>
              <span className="mx-2">•</span>
              <Trophy className="h-4 w-4 mr-1" />
              <span>
                {challenge.duration <= 7 ? "Beginner" : challenge.duration <= 21 ? "Intermediate" : "Advanced"}
              </span>
            </div>
            <p className="text-muted-foreground">{challenge.description}</p>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="daily-tips">Daily Tips</TabsTrigger>
              <TabsTrigger value="results">Expected Results</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Challenge Benefits</h3>
                  <ul className="space-y-3">
                    {challenge.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-bold mb-4">How It Works</h3>
                  <ol className="space-y-4">
                    <li className="flex items-start">
                      <div className="bg-primary/10 text-primary font-bold rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Purchase the recommended product</p>
                        <p className="text-muted-foreground">
                          Get the {product.name} to ensure you have enough wheatgrass for the entire challenge.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 text-primary font-bold rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Join the challenge</p>
                        <p className="text-muted-foreground">
                          Sign up to track your progress and receive daily tips and encouragement.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 text-primary font-bold rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Consume daily</p>
                        <p className="text-muted-foreground">
                          Take your wheatgrass shot at the same time each day, preferably in the morning on an empty
                          stomach.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 text-primary font-bold rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Track your progress</p>
                        <p className="text-muted-foreground">
                          Check in daily to mark your progress and read the daily tip for maximum benefits.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-primary/10 text-primary font-bold rounded-full h-6 w-6 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        5
                      </div>
                      <div>
                        <p className="font-medium">Complete the challenge</p>
                        <p className="text-muted-foreground">
                          Finish all {challenge.duration} days to experience the full benefits and earn your completion
                          badge.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="daily-tips" className="pt-6">
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Daily Tips & Guidance</h3>
                <p className="text-muted-foreground mb-6">
                  Follow these daily tips to maximize the benefits of your wheatgrass challenge:
                </p>

                <div className="space-y-4">
                  {challenge.dailyTips.map((tip) => (
                    <Card key={tip.day}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-primary" />
                          Day {tip.day}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{tip.tip}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="results" className="pt-6">
              <div className="space-y-6">
                <h3 className="text-xl font-bold mb-4">Expected Results</h3>
                <p className="text-muted-foreground mb-6">
                  Here's what you can expect to experience during your {challenge.duration}-day challenge:
                </p>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary/20"></div>
                  <div className="space-y-8">
                    {challenge.expectedResults.map((result) => (
                      <div key={result.day} className="relative pl-10">
                        <div className="absolute left-0 top-0 bg-primary rounded-full h-8 w-8 flex items-center justify-center text-primary-foreground font-medium">
                          {result.day}
                        </div>
                        <Card>
                          <CardContent className="p-4">
                            <p>{result.result}</p>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-md flex items-start mt-8">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-2 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Results may vary from person to person. Consistency is key to experiencing the full benefits of
                    wheatgrass.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-24 glass-card">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Challenge Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{challenge.duration} Days</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Difficulty</p>
                      <p className="font-medium">
                        {challenge.duration <= 7 ? "Beginner" : challenge.duration <= 21 ? "Intermediate" : "Advanced"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Product</p>
                      <p className="font-medium">{product.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">{product.price}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-bold mb-2">Recommended Product</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-primary font-bold">{product.price}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button className="w-full" size="lg" onClick={handleJoinChallenge}>
                    Join Challenge
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add Product to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
