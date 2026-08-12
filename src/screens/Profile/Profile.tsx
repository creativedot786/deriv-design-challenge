import { Link } from 'react-router-dom'
import { Avatar, Card, ProgressMeter, TierBadge } from '../../design-system/components'
import { currentUser } from '../../mocks/user'
import { currentUserTierProgress, nextTier, tierById, tiers } from '../../mocks/tiers'
import { wallet } from '../../mocks/fundingMethods'
import styles from './Profile.module.css'

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 6 15 12 9 18" />
  </svg>
)

/**
 * M21 — replaces the M11 stub. Tier ladder + cashback detail, plus a
 * mobile-only shortcut to /providers (desktop already has Providers in
 * the sidebar nav — see the discovery doc's navigation section on why
 * it folds in here instead of a 5th bottom-nav icon rather than being
 * duplicated in both places).
 */
export function Profile() {
  const tier = tierById(currentUserTierProgress.tierId)
  const next = nextTier(currentUserTierProgress.tierId)
  const progressPct = next
    ? ((currentUserTierProgress.sentLast12MonthsAed - tier.thresholdAed) / (next.thresholdAed - tier.thresholdAed)) * 100
    : 100

  return (
    <div className={styles.page}>
      <span className="ds-text-h1">Profile</span>

      <Card variant="flat" className={styles.identity}>
        <Avatar initials={currentUser.initials} size={48} />
        <div className={styles.identityMid}>
          <span className="ds-text-label">{currentUser.name}</span>
          <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
            Personal account
          </span>
        </div>
      </Card>

      <div className={styles.section}>
        <p className="ds-text-h2">Tier &amp; rewards</p>

        <Card variant="elevated" className={styles.tierSummary}>
          <TierBadge label={tier.name} colorVar={tier.colorVar} mutedVar={tier.mutedVar} />
          {next ? (
            <ProgressMeter
              value={progressPct}
              label={`AED ${currentUserTierProgress.sentLast12MonthsAed.toLocaleString()} of ${next.thresholdAed.toLocaleString()} to ${next.name}`}
              colorVar={tier.colorVar}
            />
          ) : (
            <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              Highest tier reached
            </span>
          )}
          <div className={styles.cashbackRow}>
            <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              Cashback earned
            </span>
            <span className="ds-text-label" style={{ color: 'var(--text-savings)' }}>
              AED {wallet.cashbackEarnedAed.toFixed(2)}
            </span>
          </div>
        </Card>

        <div className={styles.ladder}>
          {tiers.map((t) => {
            const isActive = t.id === tier.id
            return (
              <Card
                key={t.id}
                variant="flat"
                className={`${styles.tierTile} ${isActive ? styles.tierTileActive : ''}`}
                style={isActive ? { borderColor: `var(${t.colorVar})` } : undefined}
              >
                <TierBadge label={t.name} colorVar={t.colorVar} mutedVar={t.mutedVar} />
                <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
                  {t.thresholdAed === 0 ? 'Everyone starts here' : `AED ${t.thresholdAed.toLocaleString()}+ / 12mo`}
                </span>
                <span className="ds-text-label">{t.perkLabel}</span>
              </Card>
            )
          })}
        </div>
      </div>

      <Link to="/providers" className={styles.providersShortcut}>
        <span className={styles.providersShortcutIcon} aria-hidden="true">
          <LinkIcon />
        </span>
        <span className={`ds-text-label ${styles.providersShortcutMid}`}>Providers</span>
        <ChevronRightIcon />
      </Link>
    </div>
  )
}
