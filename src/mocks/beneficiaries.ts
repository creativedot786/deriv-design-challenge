/**
 * Beneficiaries — the cross-border replacement for `recipients.ts`.
 *
 * Deliberately a separate file and type, not an extension of `Recipient`:
 * the old model is a domestic-style account-to-account transfer (masked
 * account number, no country). A beneficiary is a person abroad, tied to
 * a corridor and a payout method — a different concept that happened to
 * share a name. See the product discovery doc's audit for the reasoning.
 *
 * `recipients.ts` stays as-is until the screens that consume it are
 * rebuilt (Send Money, Dashboard Quick Send) — this file doesn't replace
 * anything yet, it's additive.
 */

export type PayoutMethod = 'bank' | 'cash_pickup' | 'mobile_wallet'

interface BankDetails {
  bankName: string
  accountNumberMasked: string
  ifsc?: string
}

interface CashPickupDetails {
  branchNetwork: string
}

interface MobileWalletDetails {
  walletProvider: string
  numberMasked: string
}

export interface Beneficiary {
  id: string
  name: string
  initials: string
  corridorId: string
  payoutMethod: PayoutMethod
  bank?: BankDetails
  cashPickup?: CashPickupDetails
  mobileWallet?: MobileWalletDetails
  isFavorite: boolean
}

export const beneficiaries: Beneficiary[] = [
  {
    id: 'b1',
    name: 'Amara Khan',
    initials: 'AK',
    corridorId: 'c-in',
    payoutMethod: 'bank',
    bank: { bankName: 'HDFC Bank', accountNumberMasked: '•••• 4821', ifsc: 'HDFC0001234' },
    isFavorite: true,
  },
  {
    id: 'b2',
    name: 'Ravi Thapa',
    initials: 'RT',
    corridorId: 'c-in',
    payoutMethod: 'cash_pickup',
    cashPickup: { branchNetwork: 'Al Ansari branch network' },
    isFavorite: true,
  },
  {
    id: 'b3',
    name: 'Sara Lin',
    initials: 'SL',
    corridorId: 'c-ph',
    payoutMethod: 'mobile_wallet',
    mobileWallet: { walletProvider: 'GCash', numberMasked: '•••• 7734' },
    isFavorite: true,
  },
  {
    id: 'b4',
    name: 'Miguel Paredes',
    initials: 'MP',
    corridorId: 'c-ph',
    payoutMethod: 'bank',
    bank: { bankName: 'BDO Unibank', accountNumberMasked: '•••• 1092' },
    isFavorite: false,
  },
  {
    id: 'b5',
    name: 'Priya Nair',
    initials: 'PN',
    corridorId: 'c-pk',
    payoutMethod: 'bank',
    bank: { bankName: 'Habib Bank', accountNumberMasked: '•••• 5560' },
    isFavorite: false,
  },
  {
    id: 'b6',
    name: 'Noah Cole',
    initials: 'NC',
    corridorId: 'c-in',
    payoutMethod: 'bank',
    bank: { bankName: 'ICICI Bank', accountNumberMasked: '•••• 3348', ifsc: 'ICIC0004567' },
    isFavorite: false,
  },
]

export const favoriteBeneficiaries = beneficiaries.filter((b) => b.isFavorite)

export function beneficiariesForCorridor(corridorId: string): Beneficiary[] {
  return beneficiaries.filter((b) => b.corridorId === corridorId)
}
