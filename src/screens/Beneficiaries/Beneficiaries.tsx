import { EmptyState } from '../../design-system/components'
import styles from './Beneficiaries.module.css'

const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

/**
 * Route stub, added in M11 alongside the routing shell. Full CRUD
 * (add/edit/delete, country-conditional fields) lands in M17 — see the
 * discovery doc's "Beneficiaries" section for the target design.
 */
export function Beneficiaries() {
  return (
    <div className={styles.page}>
      <span className="ds-text-h1">Beneficiaries</span>
      <EmptyState
        icon={<PeopleIcon />}
        title="Beneficiary management is coming next"
        subtext="Add, edit, and select beneficiaries across corridors — landing in M17."
      />
    </div>
  )
}
