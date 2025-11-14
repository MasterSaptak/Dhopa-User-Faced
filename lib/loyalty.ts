export interface TierInfo {
  name: "Bronze" | "Silver" | "Gold"
  minPoints: number
  maxPoints: number | null
  color: string
  benefits: string[]
  discount: number
}

export const loyaltyTiers: TierInfo[] = [
  {
    name: "Bronze",
    minPoints: 0,
    maxPoints: 499,
    color: "from-amber-700 to-amber-900",
    benefits: ["Earn 1 point per ₹10 spent", "Birthday special discount", "Priority customer support"],
    discount: 0,
  },
  {
    name: "Silver",
    minPoints: 500,
    maxPoints: 1499,
    color: "from-gray-400 to-gray-600",
    benefits: [
      "All Bronze benefits",
      "Earn 1.5 points per ₹10 spent",
      "5% discount on all orders",
      "Free express delivery once a month",
    ],
    discount: 5,
  },
  {
    name: "Gold",
    minPoints: 1500,
    maxPoints: null,
    color: "from-yellow-400 to-yellow-600",
    benefits: [
      "All Silver benefits",
      "Earn 2 points per ₹10 spent",
      "10% discount on all orders",
      "Unlimited free express delivery",
      "Exclusive seasonal offers",
    ],
    discount: 10,
  },
]

export function getTierByPoints(points: number): TierInfo {
  for (let i = loyaltyTiers.length - 1; i >= 0; i--) {
    if (points >= loyaltyTiers[i].minPoints) {
      return loyaltyTiers[i]
    }
  }
  return loyaltyTiers[0]
}

export function getNextTier(currentTier: TierInfo): TierInfo | null {
  const currentIndex = loyaltyTiers.findIndex((t) => t.name === currentTier.name)
  if (currentIndex < loyaltyTiers.length - 1) {
    return loyaltyTiers[currentIndex + 1]
  }
  return null
}

export function getPointsToNextTier(points: number): number | null {
  const currentTier = getTierByPoints(points)
  const nextTier = getNextTier(currentTier)
  if (nextTier) {
    return nextTier.minPoints - points
  }
  return null
}
