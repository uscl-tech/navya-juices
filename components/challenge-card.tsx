"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Challenge } from "@/data/challenges"

interface ChallengeCardProps {
  challenge: Challenge
  index?: number
}

export function ChallengeCard({ challenge, index = 0 }: ChallengeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden h-full glass-card">
        <div className="aspect-video relative">
          <Image src={challenge.image || "/placeholder.svg"} alt={challenge.title} fill className="object-cover" />
          <Badge className="absolute top-2 right-2 bg-primary">{challenge.duration} Days</Badge>
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <Clock className="h-4 w-4 mr-1" />
            <span>{challenge.duration} days</span>
            <span className="mx-2">•</span>
            <Trophy className="h-4 w-4 mr-1" />
            <span>{challenge.duration <= 7 ? "Beginner" : challenge.duration <= 21 ? "Intermediate" : "Advanced"}</span>
          </div>
          <p className="text-muted-foreground mb-4 line-clamp-3">{challenge.description}</p>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0">
          <Button className="w-full" asChild>
            <Link href={`/challenges/${challenge.slug}`}>View Challenge</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
