import { Avatar, Card, EmptyState } from '../../design-system/components'
import { currentUser } from '../../mocks/user'
import styles from './Profile.module.css'

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

/**
 * Route stub, added in M11. Tier/Rewards detail (ladder, cashback
 * history) lands in M20, with the Providers entry point for mobile
 * folded in alongside it — see the discovery doc's navigation section
 * on why Providers moves here on small screens instead of a 5th
 * bottom-nav icon.
 */
export function Profile() {
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

      <EmptyState
        icon={<StarIcon />}
        title="Tier progress and rewards are coming next"
        subtext="Your tier, cashback earned, and connected providers on mobile — landing in M20."
      />
    </div>
  )
}
