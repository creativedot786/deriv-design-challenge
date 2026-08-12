import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Button,
  Card,
  EmptyState,
  ProgressMeter,
  QuickSendItem,
  Skeleton,
  TierBadge,
  TransactionRow,
} from '../../design-system/components'
import type { BadgeKind } from '../../design-system/components'
import type { AppOutletContext } from '../AppShell'
import { corridors } from '../../mocks/corridors'
import { groupTransfersByDate, lastTransfer, transfers } from '../../mocks/transfers'
import { quoteFor, ratesForCorridor } from '../../mocks/rates'
import { currentUserTierProgress, nextTier, tierById } from '../../mocks/tiers'
import { wallet } from '../../mocks/fundingMethods'
import styles from './Dashboard.module.css'

const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
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
 * M20 — full rebuild. The old Dashboard (kept until now for the sake of
 * not touching the most-visible screen before the rest of the flow
 * existed to build it against) still showed a static "$" balance and
 * mock data from before the aggregator model existed at all. Every
 * section here is now driven by real corridors/beneficiaries/providers/
 * tiers/transfers, matching what the rebuilt Send flow actually does.
 *
 * Biggest change: the hero slot goes to "Repeat your last transfer",
 * not a balance. See the discovery doc: a stored-value hero didn't fit
 * a product that routes through other providers' rails, and the
 * fastest, highest-value thing a returning user can do here is redo
 * what they already did last time — not stare at a number.
 */
export function Dashboard() {
  const { onSendMoneyClick, beneficiaries, providers } = useOutletContext<AppOutletContext>()
  const [isLoading, setIsLoading] = useState(true)

  // Simulates the initial data fetch — no backend, but the loading
  // state itself is real (not just a prop you can toggle).
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  const lastBeneficiary = beneficiaries.find((b) => b.id === lastTransfer.beneficiaryId)
  const lastProvider = providers.find((p) => p.id === lastTransfer.providerId)
  const lastCorridor = corridors.find((c) => c.id === lastTransfer.corridorId)
  const lastQuote =
    lastBeneficiary && lastProvider && lastCorridor
      ? quoteFor(lastProvider.id, lastCorridor.id, lastTransfer.amountAed)
      : undefined

  const handleRepeat = () => {
    if (!lastBeneficiary || !lastProvider) return
    onSendMoneyClick({
      beneficiaryId: lastBeneficiary.id,
      providerId: lastProvider.id,
      amount: lastTransfer.amountAed.toFixed(2),
    })
  }

  const tier = tierById(currentUserTierProgress.tierId)
  const next = nextTier(currentUserTierProgress.tierId)
  const tierProgressPct = next
    ? ((currentUserTierProgress.sentLast12MonthsAed - tier.thresholdAed) / (next.thresholdAed - tier.thresholdAed)) * 100
    : 100
  const connectedCount = providers.filter((p) => p.status === 'connected').length

  // Rate teaser: best CONNECTED provider for the same corridor as the
  // last transfer, at that same amount — an actionable nudge, not a
  // hypothetical one, since a not-connected "best" would just be a dead
  // end here (unlike the comparison screen, which exists precisely to
  // surface locked providers as an acquisition funnel).
  const teaserCorridor = lastCorridor
  const teaserRates = teaserCorridor ? ratesForCorridor(teaserCorridor.id) : []
  const bestConnectedTeaser = teaserRates
    .filter((r) => providers.find((p) => p.id === r.providerId)?.status === 'connected')
    .map((r) => ({ rate: r, provider: providers.find((p) => p.id === r.providerId)!, quote: quoteFor(r.providerId, teaserCorridor!.id, lastTransfer.amountAed)! }))
    .sort((a, b) => b.quote.recipientReceives - a.quote.recipientReceives)[0]

  const favoriteBeneficiaries = beneficiaries.filter((b) => b.isFavorite)
  const groups = groupTransfersByDate(transfers)

  return (
    <>
      <div className={styles.header}>
        <div className={styles.greeting}>
          <span className={`ds-text-caption ${styles.greetingLabel}`}>Good afternoon</span>
          <span className="ds-text-h1">Jordan Diaz</span>
        </div>
        <div className={styles.headerCta}>
          <Button variant="primary" onClick={() => onSendMoneyClick()}>
            Send money
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card variant="spotlight">
          <Skeleton inverse width={140} height={12} />
          <div style={{ height: 12 }} />
          <Skeleton inverse width={220} height={24} />
          <div style={{ height: 8 }} />
          <Skeleton inverse width={160} height={12} />
        </Card>
      ) : lastBeneficiary && lastProvider && lastCorridor && lastQuote ? (
        <Card variant="spotlight" className={styles.repeatCard}>
          <p className="ds-text-caption" style={{ color: 'var(--text-inverse-muted)' }}>
            Repeat your last transfer
          </p>
          <div className={styles.repeatMain}>
            <span className={styles.repeatFlag} aria-hidden="true">
              {lastCorridor.flag}
            </span>
            <div className={styles.repeatMid}>
              <span className="ds-text-h2">{lastBeneficiary.name}</span>
              <span className="ds-text-caption" style={{ color: 'var(--text-inverse-muted)' }}>
                via {lastProvider.name}
              </span>
            </div>
          </div>
          <p className={`ds-text-display ${styles.repeatAmount}`}>
            AED {lastTransfer.amountAed.toFixed(2)}
            <span className={`ds-text-body-lg ${styles.repeatArrow}`}> → </span>
            {lastCorridor.currencySymbol}
            {lastQuote.recipientReceives.toFixed(2)}
          </p>
          <Button variant="secondary" onClick={handleRepeat}>
            Repeat transfer
          </Button>
        </Card>
      ) : null}

      <div className={styles.mobileCta}>
        <Button variant="primary" fullWidth onClick={() => onSendMoneyClick()}>
          Send money
        </Button>
      </div>

      {!isLoading && (
        <Card variant="elevated" className={styles.statStrip}>
          <div className={styles.statTile}>
            <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              Tier
            </span>
            <TierBadge label={tier.name} colorVar={tier.colorVar} mutedVar={tier.mutedVar} />
            {next && (
              <ProgressMeter
                value={tierProgressPct}
                label={`AED ${currentUserTierProgress.sentLast12MonthsAed.toLocaleString()} of ${next.thresholdAed.toLocaleString()} to ${next.name}`}
                colorVar={tier.colorVar}
              />
            )}
          </div>
          <div className={styles.statTile}>
            <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              Providers
            </span>
            <span className="ds-text-label">
              {connectedCount} of {providers.length} connected
            </span>
          </div>
          <div className={styles.statTile}>
            <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              Wallet
            </span>
            <span className="ds-text-label">AED {wallet.floatBalanceAed.toFixed(2)}</span>
            <span className="ds-text-caption" style={{ color: 'var(--text-savings)' }}>
              + AED {wallet.cashbackEarnedAed.toFixed(2)} cashback earned
            </span>
          </div>
        </Card>
      )}

      {!isLoading && bestConnectedTeaser && teaserCorridor && (
        <Card variant="flat" className={styles.teaser}>
          <span className="ds-text-body">
            Sending to {teaserCorridor.countryName} today? <strong>{bestConnectedTeaser.provider.name}</strong> gives the
            most right now.
          </span>
          <Button variant="link" onClick={() => onSendMoneyClick()}>
            Compare rates
          </Button>
        </Card>
      )}

      <div className={styles.section}>
        <p className="ds-text-h2">Quick send</p>
        {isLoading ? (
          <div className={styles.quickSendRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width={48} height={48} circle />
            ))}
          </div>
        ) : (
          <div className={styles.quickSendRow}>
            {favoriteBeneficiaries.map((b) => (
              <QuickSendItem
                key={b.id}
                kind="person"
                initials={b.initials}
                name={b.name.split(' ')[0]}
                onClick={() => onSendMoneyClick({ beneficiaryId: b.id })}
              />
            ))}
            <QuickSendItem kind="add" />
          </div>
        )}
      </div>

      <div className={styles.section}>
        <p className="ds-text-h2">Recent transfers</p>
        {isLoading ? (
          <div className={styles.txGroup}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-2)' }}>
                <Skeleton width={40} height={40} circle />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="30%" height={12} />
                </div>
                <Skeleton width={60} height={14} />
              </div>
            ))}
          </div>
        ) : groups.size === 0 ? (
          <EmptyState icon={<InboxIcon />} title="No transfers yet" subtext="Your recent transfers will show up here." />
        ) : (
          [...groups.entries()].map(([dateGroup, items]) => (
            <div key={dateGroup} className={styles.txGroup}>
              <span className={`ds-text-caption ${styles.txGroupLabel}`}>{dateGroup}</span>
              {items.map((t) => {
                const b = beneficiaries.find((ben) => ben.id === t.beneficiaryId)
                const p = providers.find((prov) => prov.id === t.providerId)
                if (!b || !p) return null
                return (
                  <TransactionRow
                    key={t.id}
                    name={b.name}
                    meta={`${t.dateLabel} · via ${p.shortName}`}
                    amount={`-AED ${t.amountAed.toFixed(2)}`}
                    direction="outgoing"
                    status={statusBadgeKind[t.status]}
                    statusLabel={statusLabel[t.status]}
                  />
                )
              })}
            </div>
          ))
        )}
      </div>
    </>
  )
}
