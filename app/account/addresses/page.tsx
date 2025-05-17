"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AddressList } from "@/components/address/address-list"
import { useAuth } from "@/context/auth-context"

export default function AddressesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/account/addresses")
    }
  }, [user, isLoading, router])

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">Manage Addresses</h1>
          <Button variant="outline" onClick={() => router.push("/account")}>
            Back to Account
          </Button>
        </div>

        <AddressList />
      </div>
    </div>
  )
}
