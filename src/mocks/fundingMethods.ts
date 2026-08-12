/**
 * Funding methods — the "link once, never log in again" model from the
 * product discovery doc. A linked card/bank replaces per-send provider
 * login; the wallet is a small float used for instant repeat-sends and
 * as the landing place for tier cashback, not the primary way money
 * moves. See "Funding & payment methods" in the discovery doc.
 */

export type FundingMethodType = 'card' | 'bank' | 'wallet'

export interface FundingMethod {
  id: string
  type: FundingMethodType
  label: string
  detail: string
  isDefault: boolean
}

export const fundingMethods: FundingMethod[] = [
  {
    id: 'f-card1',
    type: 'card',
    label: 'Visa •••• 4821',
    detail: 'Linked Aug 2025 · Expires 09/28',
    isDefault: true,
  },
  {
    id: 'f-wallet',
    type: 'wallet',
    label: 'RemitOne Wallet',
    detail: 'Instant sends & cashback',
    isDefault: false,
  },
]

/** Presentation-ready wallet state — a small float and real cashback history, not zero. */
export const wallet = {
  floatBalanceAed: 340.5,
  cashbackEarnedAed: 128.4,
  instantSendThresholdAed: 500,
}
