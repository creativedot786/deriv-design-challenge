import { Avatar, Button, Card, QuickSendItem, TransactionRow } from '../../design-system/components'
import { currentUser } from '../../mocks/user'
import { frequentRecipients } from '../../mocks/recipients'
import { transactions, groupTransactionsByDate } from '../../mocks/transactions'
import { ActivityIcon, HomeIcon, LogoIcon, ProfileIcon, SendIcon } from './icons'
import styles from './Dashboard.module.css'

export interface DashboardProps {
  onSendMoneyClick: () => void
}

export function Dashboard({ onSendMoneyClick }: DashboardProps) {
  const groups = groupTransactionsByDate(transactions)

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.brandRow}>
          <span className={styles.logo}>
            <LogoIcon />
          </span>
          <span className={`ds-text-label ${styles.brandName}`}>Build With AI</span>
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
          <Avatar initials={currentUser.initials} size={40} />
        </div>

        <Card variant="spotlight">
          <p className="ds-text-caption" style={{ color: 'var(--text-inverse-muted)' }}>
            Available balance
          </p>
          <p className="ds-text-display">{currentUser.balance}</p>
          <p className="ds-text-caption" style={{ color: 'var(--text-inverse-muted)' }}>
            {currentUser.balanceUpdatedLabel}
          </p>
        </Card>

        <div className={styles.mobileCta}>
          <Button variant="primary" fullWidth onClick={onSendMoneyClick}>
            Send money
          </Button>
        </div>

        <div className={styles.section}>
          <p className="ds-text-h2">Quick send</p>
          <div className={styles.quickSendRow}>
            {frequentRecipients.map((r) => (
              <QuickSendItem key={r.id} kind="person" initials={r.initials} name={r.name.split(' ')[0]} />
            ))}
            <QuickSendItem kind="add" />
          </div>
        </div>

        <div className={styles.section}>
          <p className="ds-text-h2">Recent transactions</p>
          {[...groups.entries()].map(([dateGroup, items]) => (
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
          ))}
        </div>
      </main>

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
