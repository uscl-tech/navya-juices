export type Challenge = {
  id: number
  slug: string
  title: string
  duration: number // in days
  description: string
  benefits: string[]
  productId: number
  image: string
  featured?: boolean
  dailyTips: { day: number; tip: string }[]
  expectedResults: { day: number; result: string }[]
}

export const challenges: Challenge[] = [
  {
    id: 1,
    slug: "7-day-starter",
    title: "7-Day Starter Challenge",
    duration: 7,
    description:
      "Perfect for beginners, this 7-day challenge introduces you to the benefits of daily wheatgrass consumption. Experience increased energy, improved digestion, and the beginning of detoxification.",
    benefits: [
      "Kickstart your wellness journey",
      "Experience initial energy boost",
      "Begin gentle detoxification",
      "Establish a healthy daily routine",
      "Improve digestive function",
    ],
    productId: 4, // Wheatgrass Daily Pack
    image: "/vibrant-wheatgrass-display.png",
    featured: true,
    dailyTips: [
      {
        day: 1,
        tip: "Take your wheatgrass shot first thing in the morning on an empty stomach for maximum absorption.",
      },
      { day: 2, tip: "Drink plenty of water throughout the day to support the detoxification process." },
      { day: 3, tip: "Try taking your wheatgrass shot 30 minutes before exercise for an energy boost." },
      { day: 4, tip: "Notice any changes in digestion? This is normal as your body adjusts to increased nutrients." },
      { day: 5, tip: "For best results, maintain consistent timing for your daily wheatgrass consumption." },
      { day: 6, tip: "Pay attention to your skin - many people notice improvements in clarity by this point." },
      { day: 7, tip: "Reflect on how you feel compared to day 1. Consider continuing for deeper benefits." },
    ],
    expectedResults: [
      { day: 1, result: "Initial boost in mental clarity and alertness" },
      { day: 2, result: "Possible mild detoxification symptoms as your body adjusts" },
      { day: 3, result: "Improved digestive function and regularity" },
      { day: 5, result: "Increased energy levels and endurance" },
      { day: 7, result: "Enhanced overall sense of wellbeing and vitality" },
    ],
  },
  {
    id: 2,
    slug: "21-day-transformation",
    title: "21-Day Transformation Challenge",
    duration: 21,
    description:
      "Take your health to the next level with our 21-day challenge. This three-week commitment allows your body to experience deeper detoxification and more profound health benefits from consistent wheatgrass consumption.",
    benefits: [
      "Deep cellular detoxification",
      "Enhanced immune function",
      "Improved skin clarity and tone",
      "Stabilized energy levels throughout the day",
      "Reduced inflammation and faster recovery",
    ],
    productId: 9, // Monthly Subscription Box
    image: "/vibrant-wheatgrass-delivery.png",
    featured: true,
    dailyTips: [
      { day: 1, tip: "Begin your challenge by taking a photo and noting how you feel - track your transformation!" },
      { day: 3, tip: "Add a squeeze of lemon to your wheatgrass for additional detoxification benefits." },
      { day: 5, tip: "Try having your wheatgrass shot before meals to help with digestion." },
      { day: 7, tip: "One week in! Your body is now adjusting to the regular influx of nutrients." },
      { day: 10, tip: "Halfway through week two - notice any changes in your energy levels or sleep quality?" },
      { day: 14, tip: "Two weeks completed! Your body is now experiencing deeper detoxification." },
      { day: 17, tip: "Many people report clearer skin and brighter eyes by this point in the challenge." },
      { day: 20, tip: "Almost there! Consider how you'll maintain your wheatgrass habit after the challenge." },
      { day: 21, tip: "Congratulations on completing the transformation! Compare how you feel to day 1." },
    ],
    expectedResults: [
      { day: 3, result: "Improved digestive function and nutrient absorption" },
      { day: 7, result: "Enhanced energy levels and mental clarity" },
      { day: 10, result: "Potential improvements in skin appearance" },
      { day: 14, result: "Strengthened immune response and reduced inflammation" },
      { day: 18, result: "More stable mood and energy throughout the day" },
      { day: 21, result: "Significant detoxification and overall wellness improvement" },
    ],
  },
  {
    id: 3,
    slug: "30-day-wellness-revolution",
    title: "30-Day Wellness Revolution",
    duration: 30,
    description:
      "Our most comprehensive challenge, the 30-Day Wellness Revolution, transforms wheatgrass consumption into a lifestyle habit. Experience the full spectrum of benefits as your body undergoes complete cellular renewal.",
    benefits: [
      "Complete cellular renewal cycle",
      "Maximum detoxification benefits",
      "Established healthy habit formation",
      "Optimized nutrient absorption",
      "Enhanced overall wellness and vitality",
    ],
    productId: 9, // Monthly Subscription Box
    image: "/vibrant-wheatgrass-delivery.png",
    dailyTips: [
      { day: 1, tip: "Document your starting point with photos, energy levels, and any health concerns." },
      { day: 5, tip: "By now, your body is beginning to adjust to daily wheatgrass consumption." },
      { day: 7, tip: "One week complete! You may notice initial improvements in digestion and energy." },
      { day: 10, tip: "Try having your wheatgrass shot at different times to find what works best for you." },
      { day: 14, tip: "Two weeks in! Your body is now experiencing deeper detoxification effects." },
      { day: 18, tip: "Pay attention to your skin - many people notice significant improvements by now." },
      { day: 21, tip: "Three weeks complete! You've likely established a solid habit by this point." },
      { day: 25, tip: "Your body has now had almost a month to benefit from daily nutrient infusion." },
      { day: 28, tip: "Notice how your energy levels compare to when you started the challenge." },
      { day: 30, tip: "Congratulations on completing the full 30 days! Consider making this a lifestyle." },
    ],
    expectedResults: [
      { day: 7, result: "Improved digestive function and initial detoxification" },
      { day: 14, result: "Enhanced energy levels and mental clarity" },
      { day: 21, result: "Noticeable improvements in skin appearance and immune function" },
      { day: 25, result: "Deeper detoxification and reduced inflammation" },
      { day: 30, result: "Significant overall health improvements and established healthy habit" },
    ],
  },
]

export function getChallengeBySlug(slug: string): Challenge | undefined {
  return challenges.find((challenge) => challenge.slug === slug)
}

export function getFeaturedChallenges(): Challenge[] {
  return challenges.filter((challenge) => challenge.featured)
}

export function getAllChallenges(): Challenge[] {
  return challenges
}
