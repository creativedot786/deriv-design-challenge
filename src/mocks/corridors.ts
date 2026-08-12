/**
 * Send corridors — MVP scope is 3 destinations (largest UAE remittance
 * corridors), all sent from AED. See the product discovery doc: more
 * corridors are a V1 concern, not MVP.
 */

export interface Corridor {
  id: string
  countryCode: string
  countryName: string
  currencyCode: string
  currencySymbol: string
  flag: string
  /** Reference rate before any provider's spread — used to show fee vs. spread separately. */
  midMarketRate: number
}

export const corridors: Corridor[] = [
  {
    id: 'c-in',
    countryCode: 'IN',
    countryName: 'India',
    currencyCode: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
    midMarketRate: 22.94,
  },
  {
    id: 'c-ph',
    countryCode: 'PH',
    countryName: 'Philippines',
    currencyCode: 'PHP',
    currencySymbol: '₱',
    flag: '🇵🇭',
    midMarketRate: 15.62,
  },
  {
    id: 'c-pk',
    countryCode: 'PK',
    countryName: 'Pakistan',
    currencyCode: 'PKR',
    currencySymbol: '₨',
    flag: '🇵🇰',
    midMarketRate: 76.18,
  },
]

export const defaultCorridorId = 'c-in'
