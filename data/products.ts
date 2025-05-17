export type Product = {
  id: number
  slug: string
  name: string
  price: string
  category: string
  image: string
  gallery?: string[]
  description: string
  benefits: string[]
  ingredients?: string[]
  nutritionFacts?: {
    servingSize: string
    calories: number
    protein: string
    carbs: string
    fat: string
    vitamins: { name: string; amount: string }[]
  }
  featured?: boolean
  new?: boolean
  bestSeller?: boolean
  relatedProducts?: number[]
}

export const products: Product[] = [
  {
    id: 1,
    slug: "pure-wheatgrass-shot",
    name: "Pure Wheatgrass Shot",
    price: "$4.99",
    category: "shots",
    image: "/vibrant-wheatgrass-shot.png",
    gallery: ["/vibrant-wheatgrass-shot.png", "/vibrant-wheatgrass-display.png", "/premium-wheatgrass-bottle.png"],
    description:
      "Our signature pure wheatgrass shot delivers a concentrated dose of nutrients in a convenient 2oz serving. Each shot contains freshly harvested organic wheatgrass that's cold-pressed to preserve maximum nutritional value.",
    benefits: [
      "Boosts energy levels naturally",
      "Supports immune system function",
      "Aids in detoxification",
      "Rich in chlorophyll and antioxidants",
      "Promotes healthy digestion",
    ],
    ingredients: ["100% Organic Wheatgrass Juice"],
    nutritionFacts: {
      servingSize: "2 fl oz (60ml)",
      calories: 15,
      protein: "1g",
      carbs: "2g",
      fat: "0g",
      vitamins: [
        { name: "Vitamin A", amount: "30% DV" },
        { name: "Vitamin C", amount: "15% DV" },
        { name: "Vitamin K", amount: "70% DV" },
        { name: "Iron", amount: "10% DV" },
        { name: "Calcium", amount: "5% DV" },
      ],
    },
    featured: true,
    bestSeller: true,
    relatedProducts: [3, 5, 8],
  },
  {
    id: 2,
    slug: "wheatgrass-cleanse-bundle",
    name: "Wheatgrass Cleanse Bundle",
    price: "$24.99",
    category: "bundles",
    image: "/vibrant-wheatgrass-display.png",
    gallery: ["/vibrant-wheatgrass-display.png", "/vibrant-wheatgrass-shot.png", "/premium-wheatgrass-bottle.png"],
    description:
      "Our 3-day cleanse bundle includes 6 pure wheatgrass shots designed to reset your system and flood your body with essential nutrients. Perfect for a weekend detox or as a regular monthly cleanse.",
    benefits: [
      "Complete 3-day detoxification program",
      "Helps eliminate toxins from the body",
      "Boosts energy and mental clarity",
      "Supports liver and kidney function",
      "Improves digestive health",
    ],
    ingredients: ["100% Organic Wheatgrass Juice"],
    nutritionFacts: {
      servingSize: "2 fl oz (60ml)",
      calories: 15,
      protein: "1g",
      carbs: "2g",
      fat: "0g",
      vitamins: [
        { name: "Vitamin A", amount: "30% DV" },
        { name: "Vitamin C", amount: "15% DV" },
        { name: "Vitamin K", amount: "70% DV" },
        { name: "Iron", amount: "10% DV" },
        { name: "Calcium", amount: "5% DV" },
      ],
    },
    featured: true,
    relatedProducts: [4, 9],
  },
  {
    id: 3,
    slug: "wheatgrass-mint-fusion",
    name: "Wheatgrass & Mint Fusion",
    price: "$5.99",
    category: "shots",
    image: "/vibrant-wheatgrass-mint.png",
    gallery: ["/vibrant-wheatgrass-mint.png", "/vibrant-wheatgrass-shot.png", "/premium-wheatgrass-bottle.png"],
    description:
      "Our refreshing Wheatgrass & Mint Fusion combines the nutritional power of wheatgrass with the cooling, digestive benefits of organic mint. This delicious blend makes getting your daily greens a pleasure.",
    benefits: [
      "Refreshing taste with cooling mint flavor",
      "Supports digestive health",
      "Provides natural breath freshening",
      "Delivers essential nutrients and chlorophyll",
      "Helps reduce inflammation",
    ],
    ingredients: ["Organic Wheatgrass Juice", "Organic Mint Extract", "Filtered Water"],
    nutritionFacts: {
      servingSize: "2 fl oz (60ml)",
      calories: 18,
      protein: "1g",
      carbs: "3g",
      fat: "0g",
      vitamins: [
        { name: "Vitamin A", amount: "28% DV" },
        { name: "Vitamin C", amount: "16% DV" },
        { name: "Vitamin K", amount: "65% DV" },
        { name: "Iron", amount: "8% DV" },
        { name: "Calcium", amount: "5% DV" },
      ],
    },
    new: true,
    relatedProducts: [1, 5, 8],
  },
  {
    id: 4,
    slug: "wheatgrass-daily-pack",
    name: "Wheatgrass Daily Pack",
    price: "$19.99",
    category: "bundles",
    image: "/vibrant-wheatgrass-display.png",
    gallery: ["/vibrant-wheatgrass-display.png", "/vibrant-wheatgrass-shot.png"],
    description:
      "Our Wheatgrass Daily Pack provides a week's supply of our premium wheatgrass shots. Each pack contains 7 individual 2oz shots, perfect for maintaining your daily wellness routine.",
    benefits: [
      "Convenient weekly supply",
      "Individually packaged for freshness",
      "Supports daily nutritional needs",
      "Promotes consistent energy levels",
      "Helps maintain immune system health",
    ],
    ingredients: ["100% Organic Wheatgrass Juice"],
    nutritionFacts: {
      servingSize: "2 fl oz (60ml)",
      calories: 15,
      protein: "1g",
      carbs: "2g",
      fat: "0g",
      vitamins: [
        { name: "Vitamin A", amount: "30% DV" },
        { name: "Vitamin C", amount: "15% DV" },
        { name: "Vitamin K", amount: "70% DV" },
        { name: "Iron", amount: "10% DV" },
        { name: "Calcium", amount: "5% DV" },
      ],
    },
    bestSeller: true,
    relatedProducts: [2, 9],
  },
  {
    id: 5,
    slug: "wheatgrass-lemon-elixir",
    name: "Wheatgrass & Lemon Elixir",
    price: "$5.99",
    category: "shots",
    image: "/vibrant-wheatgrass-lemon.png",
    gallery: ["/vibrant-wheatgrass-lemon.png", "/vibrant-wheatgrass-shot.png"],
    description:
      "Our Wheatgrass & Lemon Elixir combines the nutritional benefits of wheatgrass with the detoxifying properties of lemon. This zesty blend is perfect for morning consumption to kickstart your metabolism.",
    benefits: [
      "Enhanced detoxification with lemon",
      "Supports healthy liver function",
      "Boosts metabolism and aids digestion",
      "Provides vitamin C and antioxidants",
      "Alkalizing effect on the body",
    ],
    ingredients: ["Organic Wheatgrass Juice", "Organic Lemon Juice", "Filtered Water"],
    nutritionFacts: {
      servingSize: "2 fl oz (60ml)",
      calories: 20,
      protein: "1g",
      carbs: "4g",
      fat: "0g",
      vitamins: [
        { name: "Vitamin A", amount: "25% DV" },
        { name: "Vitamin C", amount: "35% DV" },
        { name: "Vitamin K", amount: "60% DV" },
        { name: "Iron", amount: "8% DV" },
        { name: "Calcium", amount: "4% DV" },
      ],
    },
    featured: true,
    relatedProducts: [1, 3, 8],
  },
  {
    id: 6,
    slug: "wheatgrass-grow-kit",
    name: "Wheatgrass Grow Kit",
    price: "$29.99",
    category: "accessories",
    image: "/vibrant-wheatgrass-kit.png",
    gallery: ["/vibrant-wheatgrass-kit.png"],
    description:
      "Our Wheatgrass Grow Kit allows you to grow your own fresh wheatgrass at home. The kit includes organic wheatgrass seeds, growing trays, organic soil, and comprehensive instructions for successful cultivation.",
    benefits: [
      "Grow fresh wheatgrass at home",
      "Economical way to enjoy wheatgrass daily",
      "Educational for children and adults",
      "Ensures maximum freshness",
      "Environmentally friendly",
    ],
    ingredients: ["Organic Wheatgrass Seeds", "Organic Soil Mix", "Growing Trays", "Instruction Manual"],
    new: true,
    relatedProducts: [7],
  },
  {
    id: 7,
    slug: "premium-juicer",
    name: "Premium Juicer",
    price: "$89.99",
    category: "accessories",
    image: "/vibrant-wheatgrass-juice.png",
    gallery: ["/vibrant-wheatgrass-juice.png"],
    description:
      "Our Premium Juicer is specially designed for extracting juice from wheatgrass and other leafy greens. This cold-press masticating juicer preserves enzymes and nutrients for maximum health benefits.",
    benefits: [
      "Efficiently extracts juice from wheatgrass",
      "Cold-press technology preserves nutrients",
      "Quiet operation with durable construction",
      "Easy to clean and maintain",
      "Compact design for kitchen countertops",
    ],
    relatedProducts: [6],
  },
  {
    id: 8,
    slug: "wheatgrass-ginger-boost",
    name: "Wheatgrass & Ginger Boost",
    price: "$5.99",
    category: "shots",
    image: "/vibrant-wheatgrass-ginger.png",
    gallery: ["/vibrant-wheatgrass-ginger.png", "/vibrant-wheatgrass-shot.png"],
    description:
      "Our Wheatgrass & Ginger Boost combines the nutritional power of wheatgrass with the warming, anti-inflammatory properties of ginger. This energizing shot is perfect for supporting immune health.",
    benefits: [
      "Enhanced immune support with ginger",
      "Anti-inflammatory properties",
      "Supports digestive health",
      "Warming effect ideal for cold weather",
      "Natural energy boost",
    ],
    ingredients: ["Organic Wheatgrass Juice", "Organic Ginger Extract", "Filtered Water"],
    nutritionFacts: {
      servingSize: "2 fl oz (60ml)",
      calories: 22,
      protein: "1g",
      carbs: "4g",
      fat: "0g",
      vitamins: [
        { name: "Vitamin A", amount: "28% DV" },
        { name: "Vitamin C", amount: "18% DV" },
        { name: "Vitamin K", amount: "65% DV" },
        { name: "Iron", amount: "9% DV" },
        { name: "Calcium", amount: "5% DV" },
      ],
    },
    new: true,
    relatedProducts: [1, 3, 5],
  },
  {
    id: 9,
    slug: "monthly-subscription-box",
    name: "Monthly Subscription Box",
    price: "$49.99/mo",
    category: "bundles",
    image: "/vibrant-wheatgrass-delivery.png",
    gallery: ["/vibrant-wheatgrass-delivery.png", "/vibrant-wheatgrass-display.png"],
    description:
      "Our Monthly Subscription Box delivers a curated selection of our premium wheatgrass products to your door every month. Each box includes a mix of pure shots, flavor fusions, and seasonal specials.",
    benefits: [
      "Convenient monthly delivery",
      "Discounted pricing compared to individual purchases",
      "Variety of products in each box",
      "Exclusive access to seasonal specials",
      "Flexible subscription - pause or cancel anytime",
    ],
    ingredients: ["Various Organic Wheatgrass Products"],
    featured: true,
    relatedProducts: [2, 4],
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function getProductById(id: number): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getRelatedProducts(productId: number): Product[] {
  const product = getProductById(productId)
  if (!product || !product.relatedProducts) return []

  return product.relatedProducts.map((id) => getProductById(id)).filter(Boolean) as Product[]
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products
  return products.filter((product) => product.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured)
}

export function getNewProducts(): Product[] {
  return products.filter((product) => product.new)
}

export function getBestSellerProducts(): Product[] {
  return products.filter((product) => product.bestSeller)
}
