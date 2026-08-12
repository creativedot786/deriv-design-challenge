import { EmptyState } from '../../design-system/components'
import styles from './Activity.module.css'

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
)

/**
 * Route stub, added in M11. Full transaction detail/receipt re-open
 * lands in M21 — see the discovery doc's V1 scope.
 */
export function Activity() {
  return (
    <div className={styles.page}>
      <span className="ds-text-h1">Activity</span>
      <EmptyState
        icon={<ListIcon />}
        title="Full transfer history is coming next"
        subtext="Every transfer, with provider and corridor detail — landing in M21."
      />
    </div>
  )
}
