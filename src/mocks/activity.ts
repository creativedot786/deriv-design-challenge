/**
 * M24 — unifies transfers with the other two things that show up in a
 * real activity feed: platform cashback landing in the wallet, and
 * manual top-ups. Both were already modeled elsewhere (tiers.ts computes
 * cashback, fundingMethods.ts owns the wallet) but never surfaced as
 * feed entries — this file is presentation-only, it doesn't change
 * either source of truth.
 */

import type { Beneficiary } from './beneficiaries'
import { corridors } from './corridors'
import type { Provider } from './providers'
import { transfers } from './transfers'
import type { Transfer, TransferStatus } from './transfers'

export type ActivityKind = 'transfer' | 'cashback' | 'topup'

export interface CashbackEvent {
  id: string
  amountAed: number
  note: string
  dateLabel: string
  dateGroup: string
}

export interface TopupEvent {
  id: string
  amountAed: number
  methodLabel: string
  dateLabel: string
  dateGroup: string
}

export const cashbackEvents: CashbackEvent[] = [
  { id: 'cb1', amountAed: 1.75, note: 'From transfer to Sara Lin', dateLabel: '9:05 AM', dateGroup: 'Yesterday' },
  { id: 'cb2', amountAed: 2.5, note: 'From transfer to Amara Khan', dateLabel: 'Aug 5', dateGroup: 'Earlier this month' },
]

export const topupEvents: TopupEvent[] = [{ id: 'tu1', amountAed: 200, methodLabel: 'Visa •••• 4821', dateLabel: 'Aug 3', dateGroup: 'Earlier this month' }]

export interface ActivityItem {
  id: string
  kind: ActivityKind
  dateLabel: string
  dateGroup: string
  title: string
  subtitle: string
  amountLabel: string
  status: TransferStatus | 'completed'
}

function transferTitle(t: Transfer, beneficiaries: Beneficiary[], providers: Provider[]): { title: string; subtitle: string } | null {
  const b = beneficiaries.find((ben) => ben.id === t.beneficiaryId)
  const p = providers.find((prov) => prov.id === t.providerId)
  const c = corridors.find((corr) => corr.id === t.corridorId)
  if (!b || !p || !c) return null
  return { title: `${c.flag} ${b.name}`, subtitle: `${t.dateLabel} · via ${p.shortName} · ${c.countryName}` }
}

/**
 * Combines transfers + cashback + top-ups into one date-grouped feed.
 * Takes live beneficiaries/providers (not the static import) for the
 * same reason rankProviderRates does — App.tsx's connected/added state
 * must be reflected, not the frozen mock default.
 */
export function buildActivityFeed(beneficiaries: Beneficiary[], providers: Provider[]): ActivityItem[] {
  const items: ActivityItem[] = []

  for (const t of transfers) {
    const parts = transferTitle(t, beneficiaries, providers)
    if (!parts) continue
    items.push({
      id: t.id,
      kind: 'transfer',
      dateLabel: t.dateLabel,
      dateGroup: t.dateGroup,
      title: parts.title,
      subtitle: parts.subtitle,
      amountLabel: `-AED ${t.amountAed.toFixed(2)}`,
      status: t.status,
    })
  }

  for (const c of cashbackEvents) {
    items.push({
      id: c.id,
      kind: 'cashback',
      dateLabel: c.dateLabel,
      dateGroup: c.dateGroup,
      title: 'Cashback earned',
      subtitle: c.note,
      amountLabel: `+AED ${c.amountAed.toFixed(2)}`,
      status: 'completed',
    })
  }

  for (const u of topupEvents) {
    items.push({
      id: u.id,
      kind: 'topup',
      dateLabel: u.dateLabel,
      dateGroup: u.dateGroup,
      title: 'Added to wallet',
      subtitle: `${u.dateLabel} · via ${u.methodLabel}`,
      amountLabel: `+AED ${u.amountAed.toFixed(2)}`,
      status: 'completed',
    })
  }

  return items
}

export function groupActivityByDate(items: ActivityItem[]): Map<string, ActivityItem[]> {
  const groups = new Map<string, ActivityItem[]>()
  for (const item of items) {
    const existing = groups.get(item.dateGroup)
    if (existing) existing.push(item)
    else groups.set(item.dateGroup, [item])
  }
  return groups
}
