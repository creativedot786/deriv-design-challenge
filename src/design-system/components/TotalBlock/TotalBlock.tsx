import { Button } from '../Button'
import styles from './TotalBlock.module.css'

export interface TotalBlockProps {
  total: string
  onBreakdownClick?: () => void
}

const ChevronRightIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 6 15 12 9 18" />
  </svg>
)

export function TotalBlock({ total, onBreakdownClick }: TotalBlockProps) {
  return (
    <div className={styles.block}>
      <div className={styles.line}>
        <span className={`ds-text-body ${styles.label}`}>Total (incl. fees)</span>
        <span className="ds-text-h2">{total}</span>
      </div>
      <Button variant="link" onClick={onBreakdownClick}>
        Breakdown
        <ChevronRightIcon />
      </Button>
    </div>
  )
}
