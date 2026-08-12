import type { ReactNode } from 'react'
import styles from './SavingsChip.module.css'

export interface SavingsChipProps {
  children: ReactNode
}

/**
 * New in M12. Visually adjacent to Badge but a distinct Value-Teal
 * token (--text-savings / --bg-savings-muted, added in M9) — not a
 * status, so it deliberately doesn't compose Badge or use its dot.
 * Reserved for savings/cashback moments only, e.g. "+ AED 4.20
 * cashback" or "Save AED 14 vs. your usual". See the visual-identity
 * proposal for why this is a new color role, not a restyled success.
 */
export function SavingsChip({ children }: SavingsChipProps) {
  return <span className={`ds-text-caption ${styles.chip}`}>{children}</span>
}
