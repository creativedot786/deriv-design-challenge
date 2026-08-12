import type { ReactNode } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Card, EmptyState, TransactionRow } from '../../design-system/components'
import type { BadgeKind } from '../../design-system/components'
import type { AppOutletContext } from '../AppShell'
import { buildActivityFeed, groupActivityByDate } from '../../mocks/activity'
import type { ActivityKind } from '../../mocks/activity'
import styles from './Activity.module.css'

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
)

const CashbackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="16" x2="16" y2="8" />
    <circle cx="8.5" cy="8.5" r="0.5" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="0.5" fill="currentColor" />
  </svg>
)

const TopupIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="10" y1="11" x2="14" y2="11" />
  </svg>
)

const activityIcon: Partial<Record<ActivityKind, ReactNode>> = {
  cashback: <CashbackIcon />,
  topup: <TopupIcon />,
}
const activityDirection: Record<ActivityKind, 'incoming' | 'outgoing'> = {
  transfer: 'outgoing',
  cashback: 'incoming',
  topup: 'incoming',
}
const statusBadgeKind: Record<string, BadgeKind> = {
  completed: 'success',
  scheduled: 'neutral',
  failed: 'error',
}
const statusLabel: Record<string, string> = {
  completed: 'Completed',
  scheduled: 'Scheduled',
  failed: 'Failed',
}

/**
 * M24 — pulls in the same unified feed Home's Activity section uses
 * (mocks/activity.ts), so cashback and wallet top-ups show up here too,
 * not just outgoing transfers. One source, not a second hand-maintained
 * list — same reasoning as M22's original note about reusing transfers.ts.
 *
 * Per-transfer detail/receipt re-open is out of scope here — the
 * discovery doc puts it in V1, not MVP.
 */
export function Activity() {
  const { beneficiaries, providers } = useOutletContext<AppOutletContext>()
  const groups = groupActivityByDate(buildActivityFeed(beneficiaries, providers))

  return (
    <div className={styles.page}>
      <span className="ds-text-h1">Activity</span>

      {groups.size === 0 ? (
        <Card variant="flat">
          <EmptyState icon={<ListIcon />} title="No activity yet" subtext="Your transfers, cashback, and top-ups will show up here." />
        </Card>
      ) : (
        [...groups.entries()].map(([dateGroup, items]) => (
          <div key={dateGroup} className={styles.group}>
            <span className={`ds-text-caption ${styles.groupLabel}`}>{dateGroup}</span>
            <Card variant="elevated" className={styles.listCard}>
              {items.map((item) => (
                <TransactionRow
                  key={item.id}
                  name={item.title}
                  meta={item.subtitle}
                  amount={item.amountLabel}
                  direction={activityDirection[item.kind]}
                  status={statusBadgeKind[item.status]}
                  statusLabel={statusLabel[item.status]}
                  icon={activityIcon[item.kind]}
                />
              ))}
            </Card>
          </div>
        ))
      )}
    </div>
  )
}
