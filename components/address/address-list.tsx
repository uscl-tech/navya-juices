"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Plus, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { getSupabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { AddressForm, type AddressFormValues } from "./address-form"

type Address = AddressFormValues & {
  id: string
}

interface AddressListProps {
  onSelect?: (address: Address) => void
  selectable?: boolean
}

export function AddressList({ onSelect, selectable = false }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = getSupabase()

  const fetchAddresses = async () => {
    if (!user) {
      setAddresses([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setAddresses(data as Address[])
    } catch (err: any) {
      setError(err.message || "Failed to load addresses")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [user])

  const handleDelete = async () => {
    if (!addressToDelete) return

    try {
      const { error } = await supabase.from("addresses").delete().eq("id", addressToDelete)

      if (error) {
        throw error
      }

      setAddresses(addresses.filter((address) => address.id !== addressToDelete))
      setAddressToDelete(null)
    } catch (err: any) {
      setError(err.message || "Failed to delete address")
      console.error(err)
    }
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
          <CardDescription>You need to be logged in to manage addresses</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push("/login")}>Login</Button>
        </CardFooter>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
          <CardDescription>Loading your saved addresses...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">{error}</div>}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Addresses</h2>
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>Enter your shipping address details below</DialogDescription>
            </DialogHeader>
            <AddressForm
              onSuccess={() => {
                setIsAddingNew(false)
                fetchAddresses()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">You don't have any saved addresses yet.</p>
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={selectable ? "cursor-pointer hover:border-primary transition-colors" : ""}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{address.name}</div>
                  {address.is_default && (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{address.phone}</p>
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                {selectable ? (
                  <Button variant="default" className="w-full" onClick={() => onSelect && onSelect(address)}>
                    <Home className="mr-2 h-4 w-4" />
                    Use This Address
                  </Button>
                ) : (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingAddress(address)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Address</DialogTitle>
                          <DialogDescription>Update your shipping address details</DialogDescription>
                        </DialogHeader>
                        {editingAddress && (
                          <AddressForm
                            initialData={editingAddress}
                            onSuccess={() => {
                              setEditingAddress(null)
                              fetchAddresses()
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this address. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => {
                              setAddressToDelete(address.id)
                              handleDelete()
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
