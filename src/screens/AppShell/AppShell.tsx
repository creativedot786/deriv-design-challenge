import { NavLink, Outlet } from 'react-router-dom'
import { Avatar } from '../../design-system/components'
import { currentUser } from '../../mocks/user'
import type { Beneficiary } from '../../mocks/beneficiaries'
import type { Provider, ProviderStatus } from '../../mocks/providers'
import { ActivityIcon, HomeIcon, LogoIcon, ProfileIcon, SendIcon } from './icons'
import styles from './AppShell.module.css'

/**
 * Structurally identical to SendMoneyModal's SendMoneyPrefill, defined
 * separately on purpose — AppShell shouldn't import a type from
 * SendMoneyModal (a sibling screen, not a shared module) just to type
 * one optional callback param. See AGENTS.md: "screens don't know about
 * each other."
 */
interface SendMoneyPrefill {
  beneficiaryId?: string
  providerId?: string
  amount?: string
}

export interface AppShellProps {
  onSendMoneyClick: (prefill?: SendMoneyPrefill) => void
  onCheckRatesClick: () => void
  /**
   * Lifted to App.tsx in M17/M18 so the Beneficiaries/Providers screens
   * and the Send Money flow all read/write the same lists — mirrors the
   * existing single-source-of-truth rule for Quick Send/recipients (see
   * AGENTS.md: "don't reintroduce two separate recipient lists"), now
   * applying to beneficiaries and provider connection state too.
   */
  beneficiaries: Beneficiary[]
  onAddBeneficiary: (beneficiary: Beneficiary) => void
  providers: Provider[]
  onUpdateProviderStatus: (providerId: string, status: ProviderStatus) => void
}

export interface AppOutletContext {
  onSendMoneyClick: (prefill?: SendMoneyPrefill) => void
  onCheckRatesClick: () => void
  beneficiaries: Beneficiary[]
  onAddBeneficiary: (beneficiary: Beneficiary) => void
  providers: Provider[]
  onUpdateProviderStatus: (providerId: string, status: ProviderStatus) => void
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `ds-text-label ${styles.navLink} ${isActive ? styles.navLinkActive : ''}`

/**
 * Extracted from Dashboard in M11 — the sidebar/bottom-nav chrome now
 * wraps every routed page via <Outlet/>, instead of living inside the
 * one screen that used to be the whole app. Send Money stays a click
 * handler, not a route: it opens as a modal from any page (App.tsx owns
 * the modal state) — see the discovery doc's send-flow section.
 *
 * M19: Send Money moved out of the nav list into its own primary-button
 * CTA above it. It's an action, not a destination — styling it as a
 * plain nav link (as M11 originally did) implied it was a page you
 * navigate to and stay on, which isn't what happens.
 *
 * M24: that sidebar CTA is gone again — redundant once every page that
 * needs one has its own entry point (Home's header CTA, the mobile
 * bottom nav's raised Send button, and now the rate-checker's own
 * "Compare rates" hand-off). A second global button competing with
 * those added noise without adding a capability.
 */
export function AppShell({
  onSendMoneyClick,
  onCheckRatesClick,
  beneficiaries,
  onAddBeneficiary,
  providers,
  onUpdateProviderStatus,
}: AppShellProps) {
  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <aside className={styles.sidebar}>
          <div className={styles.brandRow}>
            <span className={styles.logo}>
              <LogoIcon />
            </span>
            <span className={`ds-text-label ${styles.brandName}`}>RemitOne</span>
          </div>

          <nav className={styles.sidebarNav}>
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/activity" className={navLinkClass}>
              Activity
            </NavLink>
            <NavLink to="/beneficiaries" className={navLinkClass}>
              Beneficiaries
            </NavLink>
            <NavLink to="/providers" className={navLinkClass}>
              Providers
            </NavLink>
          </nav>

          <NavLink to="/profile" className={styles.sidebarFooter} style={{ textDecoration: 'none' }}>
            <Avatar initials={currentUser.initials} />
            <div className={styles.sidebarFooterMid}>
              <span className="ds-text-label" style={{ color: 'var(--text-primary)' }}>
                {currentUser.name}
              </span>
              <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
                Personal account
              </span>
            </div>
          </NavLink>
        </aside>

        <main className={styles.main}>
          <Outlet
            context={
              { onSendMoneyClick, onCheckRatesClick, beneficiaries, onAddBeneficiary, providers, onUpdateProviderStatus } satisfies AppOutletContext
            }
          />
        </main>
      </div>

      <nav className={styles.bottomNav}>
        <NavLink to="/" end className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`}>
          <HomeIcon />
          Home
        </NavLink>
        <button type="button" className={styles.bottomNavSend} onClick={() => onSendMoneyClick()}>
          <span className={styles.bottomNavSendIcon}>
            <SendIcon />
          </span>
          Send
        </button>
        <NavLink to="/activity" className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`}>
          <ActivityIcon />
          Activity
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`}>
          <ProfileIcon />
          Profile
        </NavLink>
      </nav>
    </div>
  )
}
