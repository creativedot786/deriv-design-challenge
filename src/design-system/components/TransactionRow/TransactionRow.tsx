import type { ReactNode } from 'react'
import { Badge } from '../Badge'
import type { BadgeKind } from '../Badge'
import styles from './TransactionRow.module.css'

export type TransactionDirection = 'incoming' | 'outgoing'
export type TransactionIconTone = 'muted' | 'savings' | 'brand'

export interface TransactionRowProps {
  name: string
  meta: string
  amount: string
  direction: TransactionDirection
  status: BadgeKind
  statusLabel: string
  /** Overrides the default direction arrow — for activity feed entries that aren't a transfer (cashback, wallet top-up). */
  icon?: ReactNode
  /** Recolors the icon's circular background. Default 'muted' matches the original arrow treatment. */
  iconTone?: TransactionIconTone
}

const ArrowIcon = ({ direction }: { direction: TransactionDirection }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {direction === 'outgoing' ? (
      <>
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </>
    ) : (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </>
    )}
  </svg>
)

export function TransactionRow({
  name,
  meta,
  amount,
  direction,
  status,
  statusLabel,
  icon,
  iconTone = 'muted',
}: TransactionRowProps) {
  return (
    <div className={styles.row}>
      <span className={`${styles.icon} ${styles[iconTone]}`}>
        {icon ?? <ArrowIcon direction={direction} />}
      </span>
      <div className={styles.mid}>
        <span className={`ds-text-label ${styles.name}`}>{name}</span>
        <span className={`ds-text-caption ${styles.meta}`}>{meta}</span>
      </div>
      <div className={styles.trail}>
        <span className={`ds-text-label ${styles.amount} ${styles[direction]}`}>{amount}</span>
        <Badge kind={status}>{statusLabel}</Badge>
      </div>
    </div>
  )
}
