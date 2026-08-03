import type { BadgeKind } from '../design-system/components'
import type { TransactionDirection } from '../design-system/components'

export interface Transaction {
  id: string
  name: string
  meta: string
  amount: string
  direction: TransactionDirection
  status: BadgeKind
  statusLabel: string
  dateGroup: string
}

export const transactions: Transaction[] = [
  {
    id: 't1',
    name: 'Jordan Diaz',
    meta: '2:14 PM',
    amount: '-$250.00',
    direction: 'outgoing',
    status: 'success',
    statusLabel: 'Completed',
    dateGroup: 'Today',
  },
  {
    id: 't2',
    name: 'Amara Khan',
    meta: '9:02 AM',
    amount: '+$1,200.00',
    direction: 'incoming',
    status: 'neutral',
    statusLabel: 'Scheduled',
    dateGroup: 'Yesterday',
  },
  {
    id: 't3',
    name: 'Ravi Thapa',
    meta: '4:47 PM',
    amount: '-$80.00',
    direction: 'outgoing',
    status: 'error',
    statusLabel: 'Failed',
    dateGroup: 'Yesterday',
  },
]

export function groupTransactionsByDate(items: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>()
  for (const item of items) {
    const existing = groups.get(item.dateGroup)
    if (existing) {
      existing.push(item)
    } else {
      groups.set(item.dateGroup, [item])
    }
  }
  return groups
}
