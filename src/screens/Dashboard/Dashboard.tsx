import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
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
import type { BadgeKind, ButtonVariant } from '../../design-system/components'
import type { AppOutletContext } from '../AppShell'
import { corridors } from '../../mocks/corridors'
import { lastTransfer } from '../../mocks/transfers'
import { buildActivityFeed, groupActivityByDate } from '../../mocks/activity'
import type { ActivityKind } from '../../mocks/activity'
import { quoteFor, rankProviderRates } from '../../mocks/rates'
import { currentUserTierProgress, nextTier, tierById } from '../../mocks/tiers'
import { wallet } from '../../mocks/fundingMethods'
import styles from './Dashboard.module.css'

const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
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

// Representative amount for the teaser's "who's cheapest right now"
// hint — not the actual rate-checker default (that lives in
// RateCheckerModal), just enough to rank providers for one line of copy.
const TEASER_CORRIDOR = 'c-pk'
const TEASER_AMOUNT_AED = 200

/**
 * M27 — mobile gets its own layout, not just a reflowed version of
 * desktop's. Direct feedback: the bottom nav's Send button isn't a
 * destination (moved to a floating action button, see AppShell), the
 * dashboard was "too many boxes" for a phone screen, and Wallet should
 * lead — merged into a gradient hero with the greeting instead of
 * competing with it as a separate card. Desktop's grid layout is
 * untouched; `.desktopOnly`/`.mobileOnly` below are pure CSS-display
 * toggles (same pattern this file already used for `.headerCta`/
 * `.mobileCta`), not two different data models — every card's content
 * is computed once and rendered into whichever layout is visible.
 */
export function Dashboard() {
  const { onSendMoneyClick, onCheckRatesClick, onAddBeneficiaryClick, beneficiaries, providers } = useOutletContext<AppOutletContext>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)

  // Simulates the initial data fetch — no backend, but the loading
  // state itself is real (not just a prop you can toggle).
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

  // ---------- Rate teaser ----------
  const teaserCorridor = corridors.find((c) => c.id === TEASER_CORRIDOR)!
  const teaserRanked = rankProviderRates(TEASER_CORRIDOR, TEASER_AMOUNT_AED, providers, 'amount')
  const teaserBest = teaserRanked[0]

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
  const activityGroups = groupActivityByDate(buildActivityFeed(beneficiaries, providers))

  // ---------- Shared pieces, composed differently per breakpoint below ----------

  const teaserText = teaserBest?.quote && (
    <>
      <span className="ds-text-label">
        Sending to {teaserCorridor.countryName} today? {teaserBest.provider.name} gives 1 AED = {teaserBest.rate.exchangeRate}{' '}
        {teaserCorridor.currencyCode} right now.
      </span>
      <Button variant="link" onClick={onCheckRatesClick}>
        Compare rates
      </Button>
    </>
  )

  // M28 — these three take a `ctaVariant` instead of being static JSX:
  // mobile's stacked cards read as "competing" when every standalone
  // button is the same bordered Secondary style, so mobile passes
  // 'ghost' while desktop keeps 'secondary'. A parameterized function
  // is the only way to vary that per breakpoint without literally
  // duplicating each card's markup between the two layouts below.
  const renderTierCard = (ctaVariant: ButtonVariant) =>
    !isLoading && (
      <Card variant="elevated" className={styles.tierCard}>
        <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
          Tier
        </span>
        <TierBadge label={tier.name} colorVar={tier.colorVar} mutedVar={tier.mutedVar} />
        {next && (
          <>
            <ProgressMeter
              value={tierProgressPct}
              label={`AED ${currentUserTierProgress.sentLast12MonthsAed.toLocaleString()} of ${next.thresholdAed.toLocaleString()} to ${next.name}`}
              colorVar={tier.colorVar}
            />
            <div className={styles.tierNextPerk}>
              <span className="ds-text-label" style={{ color: 'var(--text-primary)' }}>
                Reach {next.name} for {next.perkLabel}
              </span>
              <Button variant={ctaVariant}>Learn more</Button>
            </div>
          </>
        )}
      </Card>
    )

  const renderRepeatCard = (ctaVariant: ButtonVariant) =>
    isLoading ? (
      <Card variant="elevated" className={styles.repeatCard}>
        <Skeleton width={120} height={12} />
        <div style={{ height: 10 }} />
        <Skeleton width={160} height={20} />
      </Card>
    ) : (
      lastBeneficiary &&
      lastProvider &&
      lastCorridor &&
      lastQuote && (
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
          <Button variant={ctaVariant} onClick={handleRepeat} className={styles.repeatCta}>
            Repeat transfer
          </Button>
        </Card>
      )
    )

  const renderQuickSendCard = (ctaVariant: ButtonVariant) => (
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
          {favoriteBeneficiaries.map((b) => {
            const c = corridors.find((corr) => corr.id === b.corridorId)!
            return (
              <QuickSendItem
                key={b.id}
                initials={b.initials}
                name={b.name.split(' ')[0]}
                flag={c.flag}
                onClick={() => onSendMoneyClick({ beneficiaryId: b.id })}
              />
            )
          })}
        </div>
      )}
      <Button variant={ctaVariant} className={styles.quickSendCta} onClick={onAddBeneficiaryClick}>
        Add beneficiary
      </Button>
    </Card>
  )

  const activitySection = (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className="ds-text-h2">Activity</p>
        <Button variant="link" onClick={() => navigate('/activity')}>
          See all
        </Button>
      </div>
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
      ) : activityGroups.size === 0 ? (
        <Card variant="flat">
          <EmptyState icon={<InboxIcon />} title="No activity yet" subtext="Your transfers, cashback, and top-ups will show up here." />
        </Card>
      ) : (
        [...activityGroups.entries()].map(([dateGroup, items]) => (
          <div key={dateGroup} className={styles.txGroup}>
            <span className={`ds-text-caption ${styles.txGroupLabel}`}>{dateGroup}</span>
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

  return (
    <>
      {/* ================= Desktop (>= 860px) ================= */}
      <div className={styles.desktopOnly}>
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

        {teaserText && (
          <Card variant="elevated" className={styles.teaserCard}>
            {teaserText}
          </Card>
        )}

        <div className={styles.heroGrid}>
          {isLoading ? (
            <Card variant="spotlight" className={styles.walletCard}>
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
              <Button variant="secondary" className={styles.walletCta}>
                Add money
              </Button>
            </Card>
          )}

          {renderTierCard('secondary')}
        </div>

        <div className={styles.statsGrid}>
          {renderRepeatCard('secondary')}
          {renderQuickSendCard('secondary')}
        </div>

        {activitySection}
      </div>

      {/* ================= Mobile (< 860px) ================= */}
      <div className={styles.mobileOnly}>
        <div className={styles.mobileHero}>
          <span className={`ds-text-caption ${styles.mobileHeroLabel}`}>Good afternoon</span>
          <span className="ds-text-h1" style={{ color: 'var(--text-inverse)' }}>
            Jordan Diaz
          </span>

          {isLoading ? (
            <>
              <div style={{ height: 8 }} />
              <Skeleton inverse width={120} height={12} />
              <div style={{ height: 8 }} />
              <Skeleton inverse width={160} height={24} />
            </>
          ) : (
            <>
              <div className={styles.mobileHeroDivider} />
              <span className={`ds-text-caption ${styles.mobileHeroLabel}`}>Wallet balance</span>
              <span className="ds-text-display" style={{ color: 'var(--text-inverse)' }}>
                AED {wallet.floatBalanceAed.toFixed(2)}
              </span>
              <span className={`ds-text-caption ${styles.mobileHeroLabel}`}>+ AED {wallet.cashbackEarnedAed.toFixed(2)} cashback earned</span>
              <Button variant="secondary" className={styles.walletCta}>
                Add money
              </Button>
            </>
          )}
        </div>

        {renderQuickSendCard('ghost')}

        {teaserText && <div className={styles.teaserRow}>{teaserText}</div>}

        {renderRepeatCard('ghost')}

        {renderTierCard('ghost')}

        {activitySection}
      </div>
    </>
  )
}
