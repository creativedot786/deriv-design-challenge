import { Avatar } from '../Avatar'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { SavingsChip } from '../SavingsChip'
import styles from './ComparisonRow.module.css'

export interface ComparisonRowProps {
  providerName: string
  providerInitials: string
  isConnected: boolean
  recipientReceivesLabel: string
  rateLabel: string
  feeLabel: string
  /** Omit both delivery fields for a sleeker, informational context (RateCheckerModal) — the footer line only renders when at least one is present. Send Money's real compare step still passes both; ETA matters once you're actually about to send. */
  deliveryEtaLabel?: string
  asOfLabel?: string
  /** "Most received" / "Fastest" / "Your usual" — quiet and factual, never more than one provider needs to "win" on the same axis. Omit if this row doesn't lead on anything. */
  rankLabel?: string
  /** Tier cashback, e.g. "+ AED 4.20 cashback". Additive to the provider's own number, never rewrites it — see the discovery doc's note on protecting the comparison's trust story. */
  cashbackLabel?: string
  /**
   * Omit for a read-only/informational context (M23's Home rate
   * checker) — no button renders at all, connected or not. There's
   * nothing to connect-to or select when the row isn't part of an
   * actual send flow.
   */
  onAction?: () => void
}

/**
 * New in M12 — the flagship comparison-screen component. Multi-metric
 * by design (provider + recipient amount + rate + fee + ETA + rank +
 * cashback + connection state) — TransactionRow is single-line and the
 * wrong shape for this, see the visual-identity proposal's component
 * gap list.
 */
export function ComparisonRow({
  providerName,
  providerInitials,
  isConnected,
  recipientReceivesLabel,
  rateLabel,
  feeLabel,
  deliveryEtaLabel,
  asOfLabel,
  rankLabel,
  cashbackLabel,
  onAction,
}: ComparisonRowProps) {
  return (
    <div className={`${styles.row} ${isConnected ? '' : styles.rowLocked}`}>
      <div className={styles.header}>
        <Avatar initials={providerInitials} size={40} />
        <div className={styles.headerMid}>
          <span className="ds-text-label">{providerName}</span>
          {rankLabel && (
            <span className="ds-text-caption" style={{ color: 'var(--text-brand)' }}>
              {rankLabel}
            </span>
          )}
        </div>
        {!isConnected && <Badge kind="neutral">Not connected</Badge>}
      </div>

      <div className={styles.amount}>
        <span
          className={`ds-text-h1 ds-font-display ${styles.amountValue} ${isConnected ? '' : styles.amountValueLocked}`}
        >
          {recipientReceivesLabel}
        </span>
        <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
          {rateLabel} · {feeLabel}
        </span>
      </div>

      {(deliveryEtaLabel || asOfLabel || (cashbackLabel && isConnected)) && (
        <div className={styles.footer}>
          {(deliveryEtaLabel || asOfLabel) && (
            <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              {[deliveryEtaLabel, asOfLabel && `rate as of ${asOfLabel}`].filter(Boolean).join(' · ')}
            </span>
          )}
          {cashbackLabel && isConnected && <SavingsChip>{cashbackLabel}</SavingsChip>}
        </div>
      )}

      {onAction && (
        <Button variant={isConnected ? 'primary' : 'secondary'} fullWidth onClick={onAction}>
          {isConnected ? 'Select this provider' : 'Connect to send this way'}
        </Button>
      )}
    </div>
  )
}
