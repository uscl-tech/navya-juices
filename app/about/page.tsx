"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Leaf, Award, Users, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  const values = [
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      title: "Sustainability",
      description:
        "We're committed to sustainable farming practices and eco-friendly packaging to minimize our environmental footprint.",
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Quality",
      description:
        "We never compromise on quality, ensuring every bottle of juice meets our rigorous standards for freshness and potency.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Community",
      description:
        "We believe in building a community of health-conscious individuals who support each other's wellness journeys.",
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Integrity",
      description:
        "Honesty and transparency are at the core of everything we do, from our sourcing to our customer relationships.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-accent/30 py-20">
        <div className="container px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Our Story</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Navya's Fresh Juices began with a simple mission: to make the extraordinary benefits of wheatgrass
              accessible to everyone.
            </p>
            <p className="text-muted-foreground mb-4">
              Founded in 2018 by Navya Patel, our journey started at local farmers' markets where Navya's handcrafted
              wheatgrass shots quickly gained a loyal following. People were drawn not just to the exceptional quality
              and taste, but to the visible health benefits they experienced.
            </p>
            <p className="text-muted-foreground">
              Today, we've grown into a beloved brand known for our commitment to organic farming, sustainable
              practices, and unwavering quality. While we've expanded our reach, our core values remain unchanged: to
              provide the purest, most potent wheatgrass juice possible.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative h-[400px] md:h-[500px]"
          >
            <Image
              src="/placeholder.svg?height=500&width=500&query=organic%20farm%20wheatgrass%20field"
              alt="Our Wheatgrass Farm"
              fill
              className="object-cover rounded-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground">The principles that guide everything we do at Navya's Fresh Juices</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card h-full">
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Process</h2>
            <p className="text-muted-foreground">From seed to bottle, we ensure quality at every step</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative h-64 mb-6 rounded-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=300&width=300&query=organic%20wheatgrass%20growing"
                  alt="Growing"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Growing</h3>
              <p className="text-muted-foreground">
                We grow our wheatgrass in nutrient-rich organic soil under optimal conditions to ensure maximum
                nutritional content.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative h-64 mb-6 rounded-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=300&width=300&query=harvesting%20wheatgrass"
                  alt="Harvesting"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Harvesting</h3>
              <p className="text-muted-foreground">
                We harvest our wheatgrass at the peak of its nutritional value, typically 7-10 days after sprouting.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative h-64 mb-6 rounded-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=300&width=300&query=bottling%20wheatgrass%20juice"
                  alt="Bottling"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Juicing & Bottling</h3>
              <p className="text-muted-foreground">
                We cold-press our wheatgrass and bottle it immediately to preserve its nutritional integrity and fresh
                flavor.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground">The passionate people behind Navya's Fresh Juices</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative h-80 mb-6 rounded-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=300&query=professional%20woman%20entrepreneur"
                  alt="Navya Patel"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">Navya Patel</h3>
              <p className="text-primary font-medium mb-3">Founder & CEO</p>
              <p className="text-muted-foreground">
                A nutritionist with a passion for plant-based wellness, Navya founded the company after experiencing the
                transformative benefits of wheatgrass firsthand.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative h-80 mb-6 rounded-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=300&query=professional%20man%20agriculture"
                  alt="Raj Kumar"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">Raj Kumar</h3>
              <p className="text-primary font-medium mb-3">Head of Agriculture</p>
              <p className="text-muted-foreground">
                With over 15 years of experience in organic farming, Raj ensures our wheatgrass is grown under optimal
                conditions for maximum nutritional value.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative h-80 mb-6 rounded-xl overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=300&query=professional%20woman%20scientist"
                  alt="Dr. Priya Shah"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-1">Dr. Priya Shah</h3>
              <p className="text-primary font-medium mb-3">Nutrition Scientist</p>
              <p className="text-muted-foreground">
                A PhD in Nutritional Sciences, Dr. Shah leads our research efforts and ensures all our products deliver
                maximum health benefits.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
