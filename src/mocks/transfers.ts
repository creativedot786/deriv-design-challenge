/**
 * Transfer history — replaces the old transactions.ts for the Dashboard
 * rebuild (M20). transactions.ts was disconnected from every model built
 * since M10 (dollar amounts, names that don't map to real beneficiary
 * IDs, no provider/corridor). This ties each entry to a real
 * beneficiary + provider + corridor so "repeat last transfer" can
 * actually prefill the Send flow, not just display a label.
 *
 * Presentation-ready by default per the discovery doc: several weeks of
 * history, not a fresh/empty account. One realistic failure included —
 * a single hiccup with a real cause reads as more credible than a
 * perfectly clean demo, same reasoning as the Providers screen's
 * default 3-of-4-connected state.
 */

export type TransferStatus = 'completed' | 'scheduled' | 'failed'

export interface Transfer {
  id: string
  beneficiaryId: string
  providerId: string
  corridorId: string
  amountAed: number
  recipientReceivesLabel: string
  status: TransferStatus
  dateLabel: string
  dateGroup: string
}

export const transfers: Transfer[] = [
  {
    id: 'tr1',
    beneficiaryId: 'b1', // Amara Khan, India
    providerId: 'p-alansari',
    corridorId: 'c-in',
    amountAed: 500,
    recipientReceivesLabel: '₹11,315.70',
    status: 'completed',
    dateLabel: '2:14 PM',
    dateGroup: 'Today',
  },
  {
    id: 'tr2',
    beneficiaryId: 'b3', // Sara Lin, Philippines
    providerId: 'p-alfardan',
    corridorId: 'c-ph',
    amountAed: 350,
    recipientReceivesLabel: '₱5,357.10',
    status: 'scheduled',
    dateLabel: '9:02 AM',
    dateGroup: 'Yesterday',
  },
  {
    id: 'tr3',
    beneficiaryId: 'b2', // Ravi Thapa, India
    providerId: 'p-uaeexchange',
    corridorId: 'c-in',
    amountAed: 80,
    recipientReceivesLabel: '₹1,823.20',
    status: 'failed',
    dateLabel: '4:47 PM',
    dateGroup: 'Yesterday',
  },
  {
    id: 'tr4',
    beneficiaryId: 'b1', // Amara Khan, India
    providerId: 'p-alansari',
    corridorId: 'c-in',
    amountAed: 500,
    recipientReceivesLabel: '₹11,300.00',
    status: 'completed',
    dateLabel: 'Aug 5',
    dateGroup: 'Earlier this month',
  },
  {
    id: 'tr5',
    beneficiaryId: 'b5', // Priya Nair, Pakistan
    providerId: 'p-alfardan',
    corridorId: 'c-pk',
    amountAed: 200,
    recipientReceivesLabel: '₨15,188.00',
    status: 'completed',
    dateLabel: 'Jul 28',
    dateGroup: 'Earlier this month',
  },
]

export function groupTransfersByDate(items: Transfer[]): Map<string, Transfer[]> {
  const groups = new Map<string, Transfer[]>()
  for (const item of items) {
    const existing = groups.get(item.dateGroup)
    if (existing) existing.push(item)
    else groups.set(item.dateGroup, [item])
  }
  return groups
}

export const lastTransfer = transfers[0]
