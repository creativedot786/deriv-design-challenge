import styles from './FundingMethodCard.module.css'

export type FundingMethodType = 'card' | 'bank' | 'wallet'

export interface FundingMethodCardProps {
  type: FundingMethodType
  label: string
  detail: string
  isDefault?: boolean
  selected?: boolean
  onClick?: () => void
}

const CardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)

const BankIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 21h18" />
    <path d="M3 10h18" />
    <path d="M5 6l7-3 7 3" />
    <path d="M4 10v11" />
    <path d="M20 10v11" />
    <path d="M8 14v3" />
    <path d="M12 14v3" />
    <path d="M16 14v3" />
  </svg>
)

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </svg>
)

const icons = {
  card: CardIcon,
  bank: BankIcon,
  wallet: WalletIcon,
}

/**
 * New in M13 — represents the "link once" funding model from the
 * discovery doc: a linked card/bank replaces per-send provider login,
 * the wallet is the instant-send/cashback float. Same selectable-row
 * pattern as RecipientOption (border-brand + bg-brand-muted when
 * selected) rather than a new interaction language.
 */
export function FundingMethodCard({ type, label, detail, isDefault, selected = false, onClick }: FundingMethodCardProps) {
  const Icon = icons[type]
  const classes = [styles.row, selected ? styles.selected : ''].filter(Boolean).join(' ')

  return (
    <button type="button" className={classes} onClick={onClick} aria-pressed={selected}>
      <span className={styles.icon} aria-hidden="true">
        <Icon />
      </span>
      <div className={styles.mid}>
        <span className={`ds-text-label ${styles.label}`}>
          {label}
          {isDefault && <span className={`ds-text-caption ${styles.defaultTag}`}>Default</span>}
        </span>
        <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
          {detail}
        </span>
      </div>
    </button>
  )
}
