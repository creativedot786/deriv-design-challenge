import { useEffect, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  QuickSendItem,
  Skeleton,
  TransactionRow,
} from '../../design-system/components'
import { currentUser } from '../../mocks/user'
import { frequentRecipients } from '../../mocks/recipients'
import { transactions, groupTransactionsByDate } from '../../mocks/transactions'
import { ActivityIcon, HomeIcon, LogoIcon, ProfileIcon, SendIcon } from './icons'
import styles from './Dashboard.module.css'

export interface DashboardProps {
  onSendMoneyClick: () => void
}

const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
)

export function Dashboard({ onSendMoneyClick }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const groups = groupTransactionsByDate(transactions)

  // Simulates the initial data fetch — no backend, but the loading
  // state itself is real (not just a prop you can toggle).
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900)
    return () => clearTimeout(timer)
  }, [])

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
            <button type="button" className={`ds-text-label ${styles.navLink} ${styles.navLinkActive}`}>
              Dashboard
            </button>
            <button type="button" className={`ds-text-label ${styles.navLink}`} onClick={onSendMoneyClick}>
              Send Money
            </button>
            <button type="button" className={`ds-text-label ${styles.navLink}`}>
              Activity
            </button>
          </nav>

          <div className={styles.sidebarFooter}>
            <Avatar initials={currentUser.initials} />
            <div className={styles.sidebarFooterMid}>
              <span className="ds-text-label">{currentUser.name}</span>
              <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
                Personal account
              </span>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.greeting}>
              <span className={`ds-text-caption ${styles.greetingLabel}`}>Good afternoon</span>
              <span className="ds-text-h1">{currentUser.name}</span>
            </div>
            <div className={styles.headerCta}>
              <Button variant="primary" onClick={onSendMoneyClick}>
                Send money
              </Button>
            </div>
          </div>

          {isLoading ? (
            <Card variant="spotlight">
              <Skeleton inverse width={120} height={12} />
              <div style={{ height: 8 }} />
              <Skeleton inverse width={200} height={32} />
              <div style={{ height: 8 }} />
              <Skeleton inverse width={100} height={12} />
            </Card>
          ) : (
            <Card variant="spotlight">
              <p className="ds-text-caption" style={{ color: 'var(--text-inverse-muted)' }}>
                Available balance
              </p>
              <p className="ds-text-display">{currentUser.balance}</p>
              <p className="ds-text-caption" style={{ color: 'var(--text-inverse-muted)' }}>
                {currentUser.balanceUpdatedLabel}
              </p>
            </Card>
          )}

          <div className={styles.mobileCta}>
            <Button variant="primary" fullWidth onClick={onSendMoneyClick}>
              Send money
            </Button>
          </div>

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
                {frequentRecipients.map((r) => (
                  <QuickSendItem key={r.id} kind="person" initials={r.initials} name={r.name.split(' ')[0]} />
                ))}
                <QuickSendItem kind="add" />
              </div>
            )}
          </div>

          <div className={styles.section}>
            <p className="ds-text-h2">Recent transactions</p>
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
              <EmptyState
                icon={<InboxIcon />}
                title="No transactions yet"
                subtext="Your recent transfers will show up here."
              />
            ) : (
              [...groups.entries()].map(([dateGroup, items]) => (
                <div key={dateGroup} className={styles.txGroup}>
                  <span className={`ds-text-caption ${styles.txGroupLabel}`}>{dateGroup}</span>
                  {items.map((t) => (
                    <TransactionRow
                      key={t.id}
                      name={t.name}
                      meta={t.meta}
                      amount={t.amount}
                      direction={t.direction}
                      status={t.status}
                      statusLabel={t.statusLabel}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      <nav className={styles.bottomNav}>
        <button type="button" className={`${styles.bottomNavItem} ${styles.bottomNavItemActive}`}>
          <HomeIcon />
          Home
        </button>
        <button type="button" className={styles.bottomNavItem} onClick={onSendMoneyClick}>
          <SendIcon />
          Send
        </button>
        <button type="button" className={styles.bottomNavItem}>
          <ActivityIcon />
          Activity
        </button>
        <button type="button" className={styles.bottomNavItem}>
          <ProfileIcon />
          Profile
        </button>
      </nav>
    </div>
  )
}
