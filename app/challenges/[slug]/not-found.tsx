import Link from "next/link"
import { ArrowLeft, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChallengeNotFound() {
  return (
    <div className="container py-20 text-center">
      <Trophy className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-4">Challenge Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn't find the challenge you're looking for. It may have been removed or the URL might be incorrect.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/challenges">
            <Trophy className="mr-2 h-4 w-4" />
            Browse All Challenges
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
