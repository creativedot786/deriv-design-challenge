import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  AmountInput,
  Button,
  Card,
  ComparisonRow,
  CountrySelector,
  EmptyState,
  ProgressMeter,
  QuickSendItem,
  SegmentedControl,
  Skeleton,
  TierBadge,
  TransactionRow,
} from '../../design-system/components'
import type { BadgeKind } from '../../design-system/components'
import type { AppOutletContext } from '../AppShell'
import { corridors } from '../../mocks/corridors'
import { groupTransfersByDate, lastTransfer, transfers } from '../../mocks/transfers'
import { quoteFor, rankProviderRates } from '../../mocks/rates'
import type { RateSortBy } from '../../mocks/rates'
import { currentUserTierProgress, nextTier, tierById } from '../../mocks/tiers'
import { wallet } from '../../mocks/fundingMethods'
import styles from './Dashboard.module.css'

const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

const SwapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
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

const DEFAULT_CHECKER_CORRIDOR = 'c-pk'
const DEFAULT_CHECKER_AMOUNT = '200.00'

/**
 * M23 — rework of the M20 rebuild based on direct feedback:
 * - Rate Checker is now the hero (was buried below Repeat/stats) —
 *   the comparison moment is this product's actual differentiation,
 *   per the discovery doc, so it leads rather than a repeat-send
 *   shortcut. Independent of any beneficiary on purpose — "just
 *   checking" is a different job than "about to send," see the M19
 *   doc comment on why the Send flow itself doesn't have this.
 * - Wallet reclaims the Spotlight hero card it had before M20;
 *   Repeat-transfer shrinks to a light card beside it instead of
 *   competing for the same dark-hero weight.
 * - Providers stat removed entirely (redundant with /providers).
 * - Quick Send and Recent Transfers get the same Card+divider
 *   treatment Beneficiaries/Providers/Activity already have —
 *   the one thing M19 didn't reach.
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

  // ---------- Rate checker ----------
  const [checkerDirection, setCheckerDirection] = useState<'send' | 'receive'>('send')
  const [checkerRawAmount, setCheckerRawAmount] = useState(DEFAULT_CHECKER_AMOUNT)
  const [checkerCorridorId, setCheckerCorridorId] = useState(DEFAULT_CHECKER_CORRIDOR)
  const [checkerSortBy, setCheckerSortBy] = useState<RateSortBy>('amount')

  const checkerCorridor = corridors.find((c) => c.id === checkerCorridorId)!
  const checkerRawNumeric = Number.parseFloat(checkerRawAmount)
  // Editing "They get" back-calculates AED using the corridor's
  // mid-market rate as a stable reference — not any one provider's
  // rate, which would create a circular "which provider sets the
  // amount that ranks the providers" problem.
  const checkerSendAmountAed =
    checkerDirection === 'send'
      ? checkerRawNumeric
      : Number.isNaN(checkerRawNumeric)
        ? Number.NaN
        : checkerRawNumeric / checkerCorridor.midMarketRate
  const isCheckerValid = !Number.isNaN(checkerSendAmountAed) && checkerSendAmountAed > 0

  const checkerRanked = isCheckerValid ? rankProviderRates(checkerCorridorId, checkerSendAmountAed, providers, checkerSortBy) : []
  const checkerTopReceive = checkerRanked[0]?.quote?.recipientReceives

  const checkerSendDisplay = checkerDirection === 'send' ? checkerRawAmount : isCheckerValid ? checkerSendAmountAed.toFixed(2) : '0.00'
  const checkerReceiveDisplay =
    checkerDirection === 'receive' ? checkerRawAmount : checkerTopReceive !== undefined ? checkerTopReceive.toFixed(2) : '0.00'

  // Preserves whatever's currently on screen when flipping which side
  // is editable, instead of resetting to a stale raw number that meant
  // something different in the other currency.
  const handleSwap = () => {
    if (checkerDirection === 'send') {
      setCheckerRawAmount(checkerReceiveDisplay)
      setCheckerDirection('receive')
    } else {
      setCheckerRawAmount(checkerSendDisplay)
      setCheckerDirection('send')
    }
  }

  // ---------- Repeat last transfer ----------
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

  // ---------- Tier ----------
  const tier = tierById(currentUserTierProgress.tierId)
  const next = nextTier(currentUserTierProgress.tierId)
  const tierProgressPct = next
    ? ((currentUserTierProgress.sentLast12MonthsAed - tier.thresholdAed) / (next.thresholdAed - tier.thresholdAed)) * 100
    : 100

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

      {/* ---------- Rate checker — the hero ---------- */}
      <Card variant="elevated" className={styles.checkerCard}>
        <p className="ds-text-h2">Check today's rates</p>

        <CountrySelector
          label="Receiving in"
          options={corridors.map((c) => ({ id: c.id, countryName: c.countryName, currencyCode: c.currencyCode, flag: c.flag }))}
          value={checkerCorridorId}
          onChange={setCheckerCorridorId}
        />

        <div className={styles.checkerFields}>
          <div className={styles.checkerField}>
            <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              You send
            </span>
            <AmountInput
              value={checkerSendDisplay}
              currencyLabel="AED"
              onChange={(e) => {
                setCheckerDirection('send')
                setCheckerRawAmount(e.target.value)
              }}
            />
          </div>

          <button type="button" className={styles.swapButton} onClick={handleSwap} aria-label="Switch which amount you're entering">
            <SwapIcon />
          </button>

          <div className={styles.checkerField}>
            <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              They get
            </span>
            <AmountInput
              value={checkerReceiveDisplay}
              currencyLabel={checkerCorridor.currencyCode}
              onChange={(e) => {
                setCheckerDirection('receive')
                setCheckerRawAmount(e.target.value)
              }}
            />
          </div>
        </div>

        <SegmentedControl
          aria-label="Sort providers by"
          value={checkerSortBy}
          onChange={setCheckerSortBy}
          options={[
            { value: 'amount', label: 'Recipient gets most' },
            { value: 'fast', label: 'Fastest' },
            { value: 'cheap', label: 'Lowest cost' },
          ]}
        />

        <div className={styles.checkerResults}>
          {checkerRanked.map(({ rate, provider, quote, isMostReceived, isFastest }) => {
            const rankLabel =
              isMostReceived && isFastest ? 'Most received · Fastest' : isMostReceived ? 'Most received' : isFastest ? 'Fastest' : undefined
            return (
              <ComparisonRow
                key={provider.id}
                providerName={provider.name}
                providerInitials={provider.initials}
                isConnected={provider.status === 'connected'}
                recipientReceivesLabel={quote ? `${checkerCorridor.currencySymbol}${quote.recipientReceives.toFixed(2)}` : '—'}
                rateLabel={`1 AED = ${rate.exchangeRate} ${checkerCorridor.currencyCode}`}
                feeLabel={rate.feeAed === 0 ? 'No fee' : `AED ${rate.feeAed} fee`}
                deliveryEtaLabel={rate.deliveryEtaLabel}
                asOfLabel={rate.asOfLabel}
                rankLabel={rankLabel}
              />
            )
          })}
        </div>
      </Card>

      {/* ---------- Repeat transfer + Wallet, side by side ---------- */}
      <div className={styles.heroGrid}>
        {isLoading ? (
          <Card variant="elevated">
            <Skeleton width={120} height={12} />
            <div style={{ height: 10 }} />
            <Skeleton width={160} height={20} />
          </Card>
        ) : lastBeneficiary && lastProvider && lastCorridor && lastQuote ? (
          <Card variant="elevated" className={styles.repeatCard}>
            <p className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              Repeat last transfer
            </p>
            <div className={styles.repeatMain}>
              <span className={styles.repeatFlag} aria-hidden="true">
                {lastCorridor.flag}
              </span>
              <div className={styles.repeatMid}>
                <span className="ds-text-label">{lastBeneficiary.name}</span>
                <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
                  via {lastProvider.name}
                </span>
              </div>
            </div>
            <p className="ds-text-body" style={{ color: 'var(--text-secondary)' }}>
              AED {lastTransfer.amountAed.toFixed(2)} → {lastCorridor.currencySymbol}
              {lastQuote.recipientReceives.toFixed(2)}
            </p>
            <Button variant="secondary" onClick={handleRepeat}>
              Repeat transfer
            </Button>
          </Card>
        ) : null}

        {isLoading ? (
          <Card variant="spotlight">
            <Skeleton inverse width={120} height={12} />
            <div style={{ height: 10 }} />
            <Skeleton inverse width={160} height={24} />
          </Card>
        ) : (
          <Card variant="spotlight" className={styles.walletCard}>
            <p className="ds-text-caption" style={{ color: 'var(--text-inverse-muted)' }}>
              Wallet balance
            </p>
            <p className="ds-text-display">AED {wallet.floatBalanceAed.toFixed(2)}</p>
            <p className="ds-text-caption" style={{ color: 'var(--text-inverse-muted)' }}>
              + AED {wallet.cashbackEarnedAed.toFixed(2)} cashback earned
            </p>
          </Card>
        )}
      </div>

      <div className={styles.mobileCta}>
        <Button variant="primary" fullWidth onClick={() => onSendMoneyClick()}>
          Send money
        </Button>
      </div>

      {/* ---------- Tier + Quick send, side by side ---------- */}
      <div className={styles.statsGrid}>
        {!isLoading && (
          <Card variant="elevated" className={styles.tierCard}>
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
          </Card>
        )}

        <Card variant="elevated" className={styles.quickSendCard}>
          <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
            Quick send
          </span>
          {isLoading ? (
            <div className={styles.quickSendRow}>
              {Array.from({ length: 4 }).map((_, i) => (
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
        </Card>
      </div>

      {/* ---------- Recent transfers ---------- */}
      <div className={styles.section}>
        <p className="ds-text-h2">Recent transfers</p>
        {isLoading ? (
          <Card variant="elevated" className={styles.listCard}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)' }}>
                <Skeleton width={40} height={40} circle />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <Skeleton width="60%" height={14} />
                  <Skeleton width="30%" height={12} />
                </div>
                <Skeleton width={60} height={14} />
              </div>
            ))}
          </Card>
        ) : groups.size === 0 ? (
          <Card variant="flat">
            <EmptyState icon={<InboxIcon />} title="No transfers yet" subtext="Your recent transfers will show up here." />
          </Card>
        ) : (
          [...groups.entries()].map(([dateGroup, items]) => (
            <div key={dateGroup} className={styles.txGroup}>
              <span className={`ds-text-caption ${styles.txGroupLabel}`}>{dateGroup}</span>
              <Card variant="elevated" className={styles.listCard}>
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
              </Card>
            </div>
          ))
        )}
      </div>
    </>
  )
}
