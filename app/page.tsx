"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { ArrowRight, Leaf, Droplets, Award, ShieldCheck, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { getFeaturedProducts } from "@/data/products"
import { getFeaturedChallenges } from "@/data/challenges"
import { ChallengeCard } from "@/components/challenge-card"

export default function Home() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  const benefits = [
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      title: "Rich in Nutrients",
      description:
        "Packed with vitamins A, C, E, K, and B complex, as well as minerals like iron, calcium, and magnesium.",
    },
    {
      icon: <Droplets className="h-8 w-8 text-primary" />,
      title: "Detoxification",
      description: "Helps cleanse the liver and eliminate toxins from the body, promoting overall health.",
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Immune Support",
      description: "Boosts immune function with its high chlorophyll content and antioxidant properties.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "100% Organic",
      description: "Grown without pesticides or chemicals, ensuring you get the purest form of nutrition.",
    },
  ]

  const featuredProducts = getFeaturedProducts().slice(0, 3)
  const featuredChallenges = getFeaturedChallenges()

  const testimonials = [
    {
      name: "Sarah J.",
      role: "Fitness Enthusiast",
      content:
        "I've tried many wheatgrass products, but Navya's is by far the freshest and most potent. It's become an essential part of my morning routine!",
      avatar: "/serene-gaze.png",
    },
    {
      name: "Michael T.",
      role: "Nutrition Coach",
      content:
        "As someone who recommends supplements professionally, I can confidently say that Navya's wheatgrass juice is top-tier. My clients love the results.",
      avatar: "/thoughtful-gaze.png",
    },
    {
      name: "Priya K.",
      role: "Yoga Instructor",
      content:
        "The purity and quality of Navya's wheatgrass juice is unmatched. It perfectly complements my yoga practice and helps me maintain balance.",
      avatar: "/serene-stretch.png",
    },
  ]

  const { addItem } = useCart()

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative hero-gradient py-20 md:py-32">
        <motion.div
          className="container px-4 grid gap-8 md:grid-cols-2 items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Pure Organic <span className="text-primary">Wheatgrass</span> Juice
              </h1>
            </motion.div>
            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Experience nature's most potent superfood in its purest form. Handcrafted for optimal nutrition and
              incredible taste.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link href="/benefits">Learn More</Link>
              </Button>
            </motion.div>
          </div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="relative h-[400px] md:h-[500px] w-full">
              <Image
                src="/premium-wheatgrass-bottle.png"
                alt="Premium Wheatgrass Juice"
                fill
                className="object-contain animate-float"
                priority
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-accent/30">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Power of Wheatgrass</h2>
            <p className="text-muted-foreground">
              Discover why our premium wheatgrass juice is the perfect addition to your wellness routine
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
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
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-2">Our most popular wheatgrass offerings</p>
            </div>
            <Button variant="ghost" className="mt-4 md:mt-0" asChild>
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Link href={`/products/${product.slug}`} className="block">
                  <Card className="overflow-hidden h-full glass-card">
                    <div className="aspect-square relative">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                      {product.new && <Badge className="absolute top-2 left-2 bg-primary">New</Badge>}
                      {product.bestSeller && <Badge className="absolute top-2 right-2 bg-amber-500">Best Seller</Badge>}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary">{product.price}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          onClick={(e) => {
                            e.preventDefault()
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                            })
                          }}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Wheatgrass Challenges</h2>
              <p className="text-muted-foreground mt-2">Transform your health with our structured juice challenges</p>
            </div>
            <Button variant="ghost" className="mt-4 md:mt-0" asChild>
              <Link href="/challenges">
                View All Challenges <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredChallenges.map((challenge, index) => (
              <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Why Take a Challenge?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Consistency is key to experiencing the full benefits of wheatgrass. Our structured challenges help you
              establish a healthy habit while maximizing results.
            </p>
            <Button size="lg" asChild>
              <Link href="/challenges">
                Explore Challenges
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground">
              Join thousands of satisfied customers who have made Navya's wheatgrass juice part of their daily routine
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="glass-card h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden">
                        <Image
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="italic">{testimonial.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Health?</h2>
              <p className="mb-8 text-primary-foreground/80">
                Start your wellness journey today with Navya's premium wheatgrass juice. Your body will thank you.
              </p>
              <Button size="lg" variant="secondary" className="rounded-full" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
