import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Card, ProviderConnectCard } from '../../design-system/components'
import type { AppOutletContext } from '../AppShell'
import styles from './Providers.module.css'

/**
 * M18 — real connect/disconnect, replacing the stub from M11. Connection
 * status is fully simulated per the discovery doc's Challenge 1: this is
 * a concept demo, not a live integration, so the flow looks and behaves
 * complete regardless of real-world provider API availability.
 *
 * Retry always succeeds in this simulation (moves to "connected") —
 * showing the happy path is the point for a demo audience; a looping
 * failure state wouldn't demonstrate anything new beyond what "failed"
 * already shows.
 */
export function Providers() {
  const { providers, onUpdateProviderStatus } = useOutletContext<AppOutletContext>()
  const [busyId, setBusyId] = useState<string | null>(null)

  const simulateConnect = (providerId: string) => {
    setBusyId(providerId)
    setTimeout(() => {
      onUpdateProviderStatus(providerId, 'connected')
      setBusyId(null)
    }, 900)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className="ds-text-h1">Providers</span>
        <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
          {providers.filter((p) => p.status === 'connected').length} of {providers.length} connected
        </span>
      </div>

      <Card variant="elevated" className={styles.listCard}>
        {providers.map((p) => (
          <ProviderConnectCard
            key={p.id}
            variant="listItem"
            providerName={p.name}
            providerInitials={p.initials}
            status={p.status}
            lastSyncedLabel={p.lastSyncedLabel}
            isBusy={busyId === p.id}
            onConnect={() => simulateConnect(p.id)}
            onRetry={() => simulateConnect(p.id)}
            onDisconnect={() => onUpdateProviderStatus(p.id, 'not_connected')}
          />
        ))}
      </Card>
    </div>
  )
}
