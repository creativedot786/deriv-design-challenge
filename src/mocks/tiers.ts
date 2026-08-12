/**
 * Tier ladder — gamification layer from the product discovery doc.
 * Cashback is a platform rebate credited to the wallet, not a rewritten
 * provider rate — see the doc's note on protecting the "honest
 * comparison" trust story. Measured on trailing-12-month sent volume.
 */

export type TierId = 'blue' | 'silver' | 'gold' | 'platinum'

export interface Tier {
  id: TierId
  name: string
  thresholdAed: number
  cashbackPercent: number
  colorVar: string
  mutedVar: string
  perkLabel: string
}

export const tiers: Tier[] = [
  { id: 'blue', name: 'Blue', thresholdAed: 0, cashbackPercent: 0, colorVar: '--tier-blue', mutedVar: '--tier-blue-muted', perkLabel: 'Standard rates' },
  { id: 'silver', name: 'Silver', thresholdAed: 20000, cashbackPercent: 0.1, colorVar: '--tier-silver', mutedVar: '--tier-silver-muted', perkLabel: '0.10% cashback' },
  { id: 'gold', name: 'Gold', thresholdAed: 50000, cashbackPercent: 0.25, colorVar: '--tier-gold', mutedVar: '--tier-gold-muted', perkLabel: '0.25% cashback' },
  { id: 'platinum', name: 'Platinum', thresholdAed: 120000, cashbackPercent: 0.4, colorVar: '--tier-platinum', mutedVar: '--tier-platinum-muted', perkLabel: '0.40% cashback + priority support' },
]

/**
 * Presentation-ready by default: a mid-progress Silver account, not a
 * fresh Blue-at-zero one — see the discovery doc's note on demo data
 * never looking like an untouched account.
 */
export const currentUserTierProgress = {
  tierId: 'silver' as TierId,
  sentLast12MonthsAed: 34500,
}

export function tierById(id: TierId): Tier {
  return tiers.find((t) => t.id === id)!
}

export function nextTier(currentTierId: TierId): Tier | undefined {
  const index = tiers.findIndex((t) => t.id === currentTierId)
  return tiers[index + 1]
}
