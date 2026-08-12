import { corridors } from './corridors'
import { providers } from './providers'

export type DeliveryMethod = 'bank' | 'cash_pickup' | 'mobile_wallet'

export interface ProviderRate {
  providerId: string
  corridorId: string
  /** 1 AED = exchangeRate units of the destination currency. Always at or below the corridor's midMarketRate — the spread is the provider's real margin. */
  exchangeRate: number
  feeAed: number
  minAmountAed: number
  deliveryMethod: DeliveryMethod
  deliveryEtaLabel: string
  /** Minutes, used for "Fastest" sorting — deliveryEtaLabel is what's shown, this is what's sorted. */
  deliveryMinutesEstimate: number
  asOfLabel: string
}

/**
 * Deliberately small, realistic deltas between providers — not the
 * dramatic gaps that are convenient for a demo. See the discovery doc's
 * note on not overselling savings with unrealistic mock numbers.
 */
export const providerRates: ProviderRate[] = [
  // India
  { providerId: 'p-alansari', corridorId: 'c-in', exchangeRate: 22.86, feeAed: 5, minAmountAed: 50, deliveryMethod: 'bank', deliveryEtaLabel: 'Within minutes', deliveryMinutesEstimate: 10, asOfLabel: '2 min ago' },
  { providerId: 'p-alfardan', corridorId: 'c-in', exchangeRate: 22.89, feeAed: 4, minAmountAed: 100, deliveryMethod: 'bank', deliveryEtaLabel: 'Within 1 hour', deliveryMinutesEstimate: 60, asOfLabel: '6 min ago' },
  { providerId: 'p-uaeexchange', corridorId: 'c-in', exchangeRate: 22.79, feeAed: 0, minAmountAed: 50, deliveryMethod: 'cash_pickup', deliveryEtaLabel: 'Within 30 min', deliveryMinutesEstimate: 30, asOfLabel: '14 min ago' },
  { providerId: 'p-lulu', corridorId: 'c-in', exchangeRate: 22.91, feeAed: 3, minAmountAed: 100, deliveryMethod: 'bank', deliveryEtaLabel: 'Within 2 hours', deliveryMinutesEstimate: 120, asOfLabel: '—' },

  // Philippines
  { providerId: 'p-alansari', corridorId: 'c-ph', exchangeRate: 15.48, feeAed: 5, minAmountAed: 50, deliveryMethod: 'bank', deliveryEtaLabel: 'Within minutes', deliveryMinutesEstimate: 10, asOfLabel: '2 min ago' },
  { providerId: 'p-alfardan', corridorId: 'c-ph', exchangeRate: 15.51, feeAed: 6, minAmountAed: 100, deliveryMethod: 'mobile_wallet', deliveryEtaLabel: 'Within minutes', deliveryMinutesEstimate: 5, asOfLabel: '6 min ago' },
  { providerId: 'p-lulu', corridorId: 'c-ph', exchangeRate: 15.53, feeAed: 4, minAmountAed: 100, deliveryMethod: 'cash_pickup', deliveryEtaLabel: 'Within 1 hour', deliveryMinutesEstimate: 60, asOfLabel: '—' },

  // Pakistan
  { providerId: 'p-alansari', corridorId: 'c-pk', exchangeRate: 75.62, feeAed: 5, minAmountAed: 50, deliveryMethod: 'bank', deliveryEtaLabel: 'Within 1 hour', deliveryMinutesEstimate: 60, asOfLabel: '2 min ago' },
  { providerId: 'p-alfardan', corridorId: 'c-pk', exchangeRate: 75.94, feeAed: 4, minAmountAed: 100, deliveryMethod: 'cash_pickup', deliveryEtaLabel: 'Within 30 min', deliveryMinutesEstimate: 30, asOfLabel: '6 min ago' },
  { providerId: 'p-uaeexchange', corridorId: 'c-pk', exchangeRate: 75.71, feeAed: 3, minAmountAed: 200, deliveryMethod: 'bank', deliveryEtaLabel: 'Next day', deliveryMinutesEstimate: 1440, asOfLabel: '14 min ago' },
  { providerId: 'p-lulu', corridorId: 'c-pk', exchangeRate: 75.88, feeAed: 4, minAmountAed: 100, deliveryMethod: 'bank', deliveryEtaLabel: 'Within 2 hours', deliveryMinutesEstimate: 120, asOfLabel: '—' },
]

export function ratesForCorridor(corridorId: string): ProviderRate[] {
  return providerRates.filter((r) => r.corridorId === corridorId)
}

export function providerRate(providerId: string, corridorId: string): ProviderRate | undefined {
  return providerRates.find((r) => r.providerId === providerId && r.corridorId === corridorId)
}

export interface RateQuote {
  rate: ProviderRate
  provider: (typeof providers)[number]
  amountAed: number
  recipientReceives: number
  spreadAed: number
}

/** Computes what the recipient actually gets, plus the hidden-in-the-rate margin (spread) shown separately from the flat fee — see the discovery doc's note on showing both for trust. */
export function quoteFor(providerId: string, corridorId: string, amountAed: number): RateQuote | undefined {
  const rate = providerRate(providerId, corridorId)
  const provider = providers.find((p) => p.id === providerId)
  const corridor = corridors.find((c) => c.id === corridorId)
  if (!rate || !provider || !corridor) return undefined

  const sendable = Math.max(amountAed - rate.feeAed, 0)
  const recipientReceives = sendable * rate.exchangeRate
  const spreadAed = (corridor.midMarketRate - rate.exchangeRate) * amountAed / corridor.midMarketRate

  return { rate, provider, amountAed, recipientReceives, spreadAed }
}
