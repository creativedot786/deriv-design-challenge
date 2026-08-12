import { Avatar } from '../Avatar'
import { Badge } from '../Badge'
import type { BadgeKind } from '../Badge'
import { Button } from '../Button'
import styles from './ProviderConnectCard.module.css'

export type ConnectionStatus = 'connected' | 'not_connected' | 'failed' | 'unavailable'

export interface ProviderConnectCardProps {
  providerName: string
  providerInitials: string
  status: ConnectionStatus
  lastSyncedLabel: string
  onConnect?: () => void
  onDisconnect?: () => void
  onRetry?: () => void
}

const statusMeta: Record<ConnectionStatus, { badgeKind: BadgeKind; badgeLabel: string }> = {
  connected: { badgeKind: 'success', badgeLabel: 'Connected' },
  not_connected: { badgeKind: 'neutral', badgeLabel: 'Not connected' },
  failed: { badgeKind: 'error', badgeLabel: 'Connection failed' },
  unavailable: { badgeKind: 'warning', badgeLabel: 'Unavailable' },
}

/**
 * New in M13, for the Providers screen (M18). Reuses Badge's existing
 * 4 semantic kinds for the 4 connection states rather than inventing
 * new status chrome — see the visual-identity proposal's note that
 * these map cleanly.
 *
 * `unavailable` deliberately renders no action: per the discovery doc,
 * "explain why, don't imply a retry will help" — this is the provider
 * itself being down, not something reconnecting fixes.
 */
export function ProviderConnectCard({
  providerName,
  providerInitials,
  status,
  lastSyncedLabel,
  onConnect,
  onDisconnect,
  onRetry,
}: ProviderConnectCardProps) {
  const { badgeKind, badgeLabel } = statusMeta[status]

  return (
    <div className={styles.row}>
      <Avatar initials={providerInitials} size={40} />
      <div className={styles.mid}>
        <div className={styles.nameRow}>
          <span className="ds-text-label">{providerName}</span>
          <Badge kind={badgeKind}>{badgeLabel}</Badge>
        </div>
        <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
          {status === 'unavailable' ? 'This provider is temporarily down — try again later.' : `Last synced ${lastSyncedLabel}`}
        </span>
      </div>

      {status === 'connected' && onDisconnect && (
        <Button variant="ghost" onClick={onDisconnect}>
          Disconnect
        </Button>
      )}
      {status === 'not_connected' && onConnect && (
        <Button variant="primary" onClick={onConnect}>
          Connect
        </Button>
      )}
      {status === 'failed' && onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  )
}
