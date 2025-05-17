"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    }, 1500)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-accent/30 py-16">
        <div className="container px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions about our products or want to place a bulk order? We'd love to hear from you!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

              <div className="grid gap-6">
                <Card className="glass-card">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Our Location</h3>
                      <p className="text-muted-foreground">
                        123 Green Valley Road
                        <br />
                        Wellness District
                        <br />
                        Healthville, HV 12345
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-muted-foreground">
                        (555) 123-4567
                        <br />
                        Monday to Friday, 9am to 5pm
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">
                        info@navyasjuices.com
                        <br />
                        orders@navyasjuices.com
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Monday to Friday: 9am - 5pm
                        <br />
                        Saturday: 10am - 4pm
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

              <Card className="glass-card">
                <CardContent className="p-6">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
                        <Send className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-4">
                        Thank you for reaching out. We'll get back to you as soon as possible.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)}>Send Another Message</Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={formState.name} onChange={handleChange} required />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formState.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" value={formState.subject} onChange={handleChange} required />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          rows={5}
                          value={formState.message}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-4">Visit Our Store</h2>
            <p className="text-muted-foreground">
              Stop by our flagship store to try our fresh wheatgrass juice and meet our team
            </p>
          </div>

          <div className="relative h-[400px] rounded-xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2s150%20Park%20Row%2C%20New%20York%2C%20NY%2010007%2C%20USA!5e0!3m2!1sen!2sus!4v1652813333496!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  )
}
