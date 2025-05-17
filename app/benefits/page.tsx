"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, Brain, Droplets, Dumbbell, Zap, ShieldCheck, Leaf, Sparkles } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function BenefitsPage() {
  const benefits = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Heart Health",
      description:
        "Wheatgrass contains potassium and magnesium, which help regulate blood pressure and maintain heart health.",
    },
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "Cognitive Function",
      description:
        "The antioxidants in wheatgrass help protect brain cells from oxidative stress, potentially improving cognitive function.",
    },
    {
      icon: <Droplets className="h-8 w-8 text-primary" />,
      title: "Detoxification",
      description: "Wheatgrass helps cleanse the liver and eliminate toxins from the body, promoting overall health.",
    },
    {
      icon: <Dumbbell className="h-8 w-8 text-primary" />,
      title: "Energy Boost",
      description:
        "Rich in chlorophyll, wheatgrass increases oxygen supply to cells, enhancing energy levels and physical performance.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Immune Support",
      description: "Packed with vitamins and minerals that strengthen the immune system and help fight off infections.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "Anti-inflammatory",
      description:
        "Contains compounds that help reduce inflammation in the body, potentially alleviating symptoms of chronic conditions.",
    },
    {
      icon: <Leaf className="h-8 w-8 text-primary" />,
      title: "Digestive Health",
      description: "Supports healthy digestion and may help alleviate digestive issues like constipation and bloating.",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Skin Health",
      description:
        "The vitamins and minerals in wheatgrass promote healthy skin, potentially reducing acne and signs of aging.",
    },
  ]

  const faqs = [
    {
      question: "How much wheatgrass juice should I drink daily?",
      answer:
        "For beginners, we recommend starting with 1 oz (30ml) daily and gradually increasing to 2-4 oz (60-120ml) per day. It's best to consume wheatgrass juice on an empty stomach for optimal absorption.",
    },
    {
      question: "What does wheatgrass juice taste like?",
      answer:
        "Wheatgrass juice has a distinctive earthy, grassy flavor. Our premium wheatgrass is known for its milder, sweeter taste compared to other varieties. Many customers find it refreshing, especially when they experience the energy boost it provides.",
    },
    {
      question: "How long does your wheatgrass juice stay fresh?",
      answer:
        "Our fresh wheatgrass juice should be consumed within 3-5 days of opening when stored properly in the refrigerator. Our flash-frozen wheatgrass shots can be stored in the freezer for up to 6 months without losing nutritional value.",
    },
    {
      question: "Can I take wheatgrass juice if I'm pregnant or nursing?",
      answer:
        "While wheatgrass is generally considered safe, we recommend consulting with your healthcare provider before adding it to your diet if you're pregnant or nursing.",
    },
    {
      question: "Is your wheatgrass juice organic?",
      answer:
        "Yes, all of our wheatgrass is 100% certified organic. We grow our wheatgrass without pesticides, herbicides, or chemical fertilizers to ensure the purest, most nutritious product possible.",
    },
    {
      question: "Can wheatgrass juice help with weight loss?",
      answer:
        "Wheatgrass juice can support weight management as part of a balanced diet and healthy lifestyle. It's nutrient-dense but low in calories, and may help reduce cravings by providing essential nutrients.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-accent/30 py-20">
        <div className="container px-4 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">The Incredible Benefits of Wheatgrass</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Discover why wheatgrass is considered one of nature's most potent superfoods and how it can transform your
              health and wellbeing.
            </p>
            <Button size="lg" className="rounded-full">
              Shop Wheatgrass Products
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative h-[400px] md:h-[500px]"
          >
            <Image
              src="/placeholder.svg?height=500&width=500&query=wheatgrass%20juice%20benefits%20health"
              alt="Wheatgrass Benefits"
              fill
              className="object-cover rounded-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Nutritional Profile */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nutritional Powerhouse</h2>
            <p className="text-muted-foreground">
              Wheatgrass contains an impressive array of nutrients that support overall health and wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4">Vitamins</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Vitamin A - Supports vision and immune function</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Vitamin C - Powerful antioxidant and immune booster</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Vitamin E - Protects cells from oxidative damage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Vitamin K - Essential for blood clotting and bone health</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>B-Complex Vitamins - Support energy production and brain function</span>
                    </li>
                  </ul>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4">Minerals</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Iron - Essential for oxygen transport in the blood</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Calcium - Supports bone health and muscle function</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Magnesium - Involved in over 300 biochemical reactions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Potassium - Regulates fluid balance and nerve signals</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Zinc - Supports immune function and wound healing</span>
                    </li>
                  </ul>
                </div>

                <div className="glass-card p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4">Other Compounds</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Chlorophyll - Natural detoxifier and blood builder</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Enzymes - Aid digestion and nutrient absorption</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Amino Acids - Building blocks of proteins</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span>Antioxidants - Protect cells from free radical damage</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="relative h-[600px]"
            >
              <Image
                src="/placeholder.svg?height=600&width=500&query=wheatgrass%20nutritional%20profile%20infographic"
                alt="Wheatgrass Nutritional Profile"
                fill
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Health Benefits */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Health Benefits</h2>
            <p className="text-muted-foreground">
              Discover the many ways wheatgrass can improve your health and wellbeing
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

      {/* Research & Studies */}
      <section className="py-20">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Research & Studies</h2>
            <p className="text-muted-foreground">Scientific evidence supporting the health benefits of wheatgrass</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Antioxidant Properties</h3>
                <p className="text-muted-foreground">
                  A 2018 study published in the Journal of Functional Foods found that wheatgrass extract exhibited
                  significant antioxidant activity, helping to neutralize free radicals and reduce oxidative stress in
                  cells.
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Anti-inflammatory Effects</h3>
                <p className="text-muted-foreground">
                  Research published in the Journal of Inflammation found that wheatgrass juice reduced inflammation
                  markers in patients with chronic inflammatory conditions, suggesting its potential as a natural
                  anti-inflammatory agent.
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Blood Health</h3>
                <p className="text-muted-foreground">
                  A clinical trial published in the Journal of Clinical and Diagnostic Research showed that regular
                  consumption of wheatgrass juice increased hemoglobin levels in patients with anemia, suggesting its
                  potential to improve blood health.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Digestive Health</h3>
                <p className="text-muted-foreground">
                  A study in the Journal of Complementary and Integrative Medicine found that wheatgrass supplementation
                  improved symptoms in patients with digestive disorders, including reduced bloating and improved
                  regularity.
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Immune Function</h3>
                <p className="text-muted-foreground">
                  Research in the International Journal of Chemical Studies demonstrated that wheatgrass extract
                  enhanced immune cell activity, potentially boosting the body's natural defense mechanisms against
                  infections.
                </p>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Detoxification</h3>
                <p className="text-muted-foreground">
                  A 2020 study in the Journal of Ayurveda and Integrative Medicine found that wheatgrass supplementation
                  supported liver function and enhanced the body's natural detoxification processes.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-accent/30">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Common questions about wheatgrass and its benefits</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience the Benefits Yourself</h2>
              <p className="mb-8 text-muted-foreground">
                Ready to transform your health with the power of wheatgrass? Try our premium organic wheatgrass juice
                today.
              </p>
              <Button size="lg" className="rounded-full">
                Shop Wheatgrass Products
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
