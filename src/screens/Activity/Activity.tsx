import { useOutletContext } from 'react-router-dom'
import { Card, EmptyState, TransactionRow } from '../../design-system/components'
import type { BadgeKind } from '../../design-system/components'
import type { AppOutletContext } from '../AppShell'
import { corridors } from '../../mocks/corridors'
import { groupTransfersByDate, transfers } from '../../mocks/transfers'
import styles from './Activity.module.css'

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
)

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
 * M22 — replaces the M11 stub. Full transfer history (Home only shows
 * the recent slice), grouped by date, each row carrying provider and
 * corridor context. Reuses the same real transfers.ts data as Home
 * (M20) — one source, not a second hand-maintained list.
 *
 * Applies the M19 list-container fix from the start this time rather
 * than after the fact: rows live inside a bounded Card with dividers,
 * not floating directly on the page canvas.
 *
 * Per-transfer detail/receipt re-open is out of scope here — the
 * discovery doc puts it in V1, not MVP.
 */
export function Activity() {
  const { beneficiaries, providers } = useOutletContext<AppOutletContext>()
  const groups = groupTransfersByDate(transfers)

  return (
    <div className={styles.page}>
      <span className="ds-text-h1">Activity</span>

      {transfers.length === 0 ? (
        <Card variant="flat">
          <EmptyState icon={<ListIcon />} title="No transfers yet" subtext="Your transfer history will show up here." />
        </Card>
      ) : (
        [...groups.entries()].map(([dateGroup, items]) => (
          <div key={dateGroup} className={styles.group}>
            <span className={`ds-text-caption ${styles.groupLabel}`}>{dateGroup}</span>
            <Card variant="elevated" className={styles.listCard}>
              {items.map((t) => {
                const b = beneficiaries.find((ben) => ben.id === t.beneficiaryId)
                const p = providers.find((prov) => prov.id === t.providerId)
                const c = corridors.find((corr) => corr.id === t.corridorId)
                if (!b || !p || !c) return null
                return (
                  <TransactionRow
                    key={t.id}
                    name={`${c.flag} ${b.name}`}
                    meta={`${t.dateLabel} · via ${p.shortName} · ${c.countryName}`}
                    amount={`-AED ${t.amountAed.toFixed(2)}`}
                    direction="outgoing"
                    status={statusBadgeKind[t.status]}
                    statusLabel={statusLabel[t.status]}
                  />
                )
              })}
            </Card>
          </div>
        ))
      )}
    </div>
  )
}
