import { EmptyState } from '../../design-system/components'
import styles from './Providers.module.css'

const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

/**
 * Route stub, added in M11. Connect/disconnect flow and the four
 * provider states (connected/not connected/failed/unavailable) land in
 * M18 — see the discovery doc's "Connected providers" section.
 */
export function Providers() {
  return (
    <div className={styles.page}>
      <span className="ds-text-h1">Providers</span>
      <EmptyState
        icon={<LinkIcon />}
        title="Provider connections are coming next"
        subtext="Connect, disconnect, and check sync status across Al Ansari, Al Fardan, and more — landing in M18."
      />
    </div>
  )
}
