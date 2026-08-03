export interface Recipient {
  id: string
  initials: string
  name: string
  accountMeta: string
  /** Shown in the Dashboard's Quick Send row — a subset of all recipients. */
  isFrequent: boolean
}

export const recipients: Recipient[] = [
  { id: 'r1', initials: 'AK', name: 'Amara Khan', accountMeta: 'Account ending 4821', isFrequent: true },
  { id: 'r2', initials: 'RT', name: 'Ravi Thapa', accountMeta: 'Account ending 2290', isFrequent: true },
  { id: 'r3', initials: 'SL', name: 'Sara Lin', accountMeta: 'Account ending 7734', isFrequent: true },
  { id: 'r4', initials: 'MP', name: 'Miguel Paredes', accountMeta: 'Account ending 1092', isFrequent: true },
  { id: 'r5', initials: 'PN', name: 'Priya Nair', accountMeta: 'Account ending 5560', isFrequent: false },
  { id: 'r6', initials: 'NC', name: 'Noah Cole', accountMeta: 'Account ending 3348', isFrequent: false },
]

export const frequentRecipients = recipients.filter((r) => r.isFrequent)
