import { NavLink, Outlet } from 'react-router-dom'
import { Avatar } from '../../design-system/components'
import { currentUser } from '../../mocks/user'
import { ActivityIcon, HomeIcon, LogoIcon, ProfileIcon, SendIcon } from './icons'
import styles from './AppShell.module.css'

export interface AppShellProps {
  onSendMoneyClick: () => void
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `ds-text-label ${styles.navLink} ${isActive ? styles.navLinkActive : ''}`

/**
 * Extracted from Dashboard in M11 — the sidebar/bottom-nav chrome now
 * wraps every routed page via <Outlet/>, instead of living inside the
 * one screen that used to be the whole app. Send Money stays a click
 * handler, not a route: it opens as a modal from any page (App.tsx owns
 * the modal state) — see the discovery doc's send-flow section.
 */
export function AppShell({ onSendMoneyClick }: AppShellProps) {
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
            <button type="button" className={`ds-text-label ${styles.navLink}`} onClick={onSendMoneyClick}>
              Send Money
            </button>
            <NavLink to="/beneficiaries" className={navLinkClass}>
              Beneficiaries
            </NavLink>
            <NavLink to="/providers" className={navLinkClass}>
              Providers
            </NavLink>
            <NavLink to="/activity" className={navLinkClass}>
              Activity
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
          <Outlet context={{ onSendMoneyClick }} />
        </main>
      </div>

      <nav className={styles.bottomNav}>
        <NavLink to="/" end className={({ isActive }) => `${styles.bottomNavItem} ${isActive ? styles.bottomNavItemActive : ''}`}>
          <HomeIcon />
          Home
        </NavLink>
        <button type="button" className={styles.bottomNavItem} onClick={onSendMoneyClick}>
          <SendIcon />
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
