import { getSupabase } from "@/lib/supabase"

export async function seedDatabase() {
  const supabase = getSupabase()

  // Check if products already exist
  const { data: existingProducts } = await supabase.from("products").select("id").limit(1)

  if (existingProducts && existingProducts.length > 0) {
    console.log("Database already seeded")
    return
  }

  console.log("Seeding database...")

  // Insert products
  const { error: productsError } = await supabase.from("products").insert([
    {
      name: "Pure Wheatgrass Shot",
      description:
        "Our signature pure wheatgrass shot delivers a concentrated dose of nutrients in a convenient 2oz serving. Each shot contains freshly harvested organic wheatgrass that's cold-pressed to preserve maximum nutritional value.",
      price: 4.99,
      image_url: "/vibrant-wheatgrass-shot.png",
      category: "shots",
      is_featured: true,
    },
    {
      name: "Wheatgrass Cleanse Bundle",
      description:
        "Our 3-day cleanse bundle includes 6 pure wheatgrass shots designed to reset your system and flood your body with essential nutrients. Perfect for a weekend detox or as a regular monthly cleanse.",
      price: 24.99,
      image_url: "/vibrant-wheatgrass-display.png",
      category: "bundles",
      is_featured: true,
    },
    {
      name: "Wheatgrass & Mint Fusion",
      description:
        "Our refreshing Wheatgrass & Mint Fusion combines the nutritional power of wheatgrass with the cooling, digestive benefits of organic mint. This delicious blend makes getting your daily greens a pleasure.",
      price: 5.99,
      image_url: "/vibrant-wheatgrass-mint.png",
      category: "shots",
    },
    {
      name: "Wheatgrass Daily Pack",
      description:
        "Our Wheatgrass Daily Pack provides a week's supply of our premium wheatgrass shots. Each pack contains 7 individual 2oz shots, perfect for maintaining your daily wellness routine.",
      price: 19.99,
      image_url: "/vibrant-wheatgrass-display.png",
      category: "bundles",
      is_featured: true,
    },
    {
      name: "Wheatgrass & Lemon Elixir",
      description:
        "Our Wheatgrass & Lemon Elixir combines the nutritional benefits of wheatgrass with the detoxifying properties of lemon. This zesty blend is perfect for morning consumption to kickstart your metabolism.",
      price: 5.99,
      image_url: "/vibrant-wheatgrass-lemon.png",
      category: "shots",
      is_featured: true,
    },
    {
      name: "Wheatgrass Grow Kit",
      description:
        "Our Wheatgrass Grow Kit allows you to grow your own fresh wheatgrass at home. The kit includes organic wheatgrass seeds, growing trays, organic soil, and comprehensive instructions for successful cultivation.",
      price: 29.99,
      image_url: "/vibrant-wheatgrass-kit.png",
      category: "accessories",
    },
    {
      name: "Premium Juicer",
      description:
        "Our Premium Juicer is specially designed for extracting juice from wheatgrass and other leafy greens. This cold-press masticating juicer preserves enzymes and nutrients for maximum health benefits.",
      price: 89.99,
      image_url: "/vibrant-wheatgrass-juice.png",
      category: "accessories",
    },
    {
      name: "Wheatgrass & Ginger Boost",
      description:
        "Our Wheatgrass & Ginger Boost combines the nutritional power of wheatgrass with the warming, anti-inflammatory properties of ginger. This energizing shot is perfect for supporting immune health.",
      price: 5.99,
      image_url: "/vibrant-wheatgrass-ginger.png",
      category: "shots",
    },
    {
      name: "Monthly Subscription Box",
      description:
        "Our Monthly Subscription Box delivers a curated selection of our premium wheatgrass products to your door every month. Each box includes a mix of pure shots, flavor fusions, and seasonal specials.",
      price: 49.99,
      image_url: "/vibrant-wheatgrass-delivery.png",
      category: "bundles",
      is_featured: true,
    },
  ])

  if (productsError) {
    console.error("Error seeding products:", productsError)
    return
  }

  // Get the inserted products to reference their IDs
  const { data: products } = await supabase.from("products").select("*")

  if (!products) {
    console.error("Failed to retrieve products after insertion")
    return
  }

  // Find product IDs by name
  const findProductId = (name: string) => {
    const product = products.find((p) => p.name === name)
    return product ? product.id : null
  }

  // Insert challenges
  const { error: challengesError } = await supabase.from("challenges").insert([
    {
      title: "7-Day Starter Challenge",
      slug: "7-day-starter",
      description:
        "Perfect for beginners, this 7-day challenge introduces you to the benefits of daily wheatgrass consumption. Experience increased energy, improved digestion, and the beginning of detoxification.",
      duration: 7,
      product_id: findProductId("Wheatgrass Daily Pack"),
      image_url: "/vibrant-wheatgrass-display.png",
      is_featured: true,
    },
    {
      title: "21-Day Transformation Challenge",
      slug: "21-day-transformation",
      description:
        "Take your health to the next level with our 21-day challenge. This three-week commitment allows your body to experience deeper detoxification and more profound health benefits from consistent wheatgrass consumption.",
      duration: 21,
      product_id: findProductId("Monthly Subscription Box"),
      image_url: "/vibrant-wheatgrass-delivery.png",
      is_featured: true,
    },
    {
      title: "30-Day Wellness Revolution",
      slug: "30-day-wellness-revolution",
      description:
        "Our most comprehensive challenge, the 30-Day Wellness Revolution, transforms wheatgrass consumption into a lifestyle habit. Experience the full spectrum of benefits as your body undergoes complete cellular renewal.",
      duration: 30,
      product_id: findProductId("Monthly Subscription Box"),
      image_url: "/vibrant-wheatgrass-delivery.png",
    },
  ])

  if (challengesError) {
    console.error("Error seeding challenges:", challengesError)
    return
  }

  console.log("Database seeded successfully!")
}
