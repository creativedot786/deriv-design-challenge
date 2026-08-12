import styles from './TierBadge.module.css'

export interface TierBadgeProps {
  label: string
  /** CSS custom property name for the tier's color, e.g. "--tier-gold" (see colors.css, M9). */
  colorVar: string
  /** CSS custom property name for the tier's muted background, e.g. "--tier-gold-muted". */
  mutedVar: string
}

/**
 * New in M14. Deliberately not built on Badge — Badge's 4 kinds are
 * status colors (success/warning/error/neutral), not a rank system,
 * and tiers need their own 4-color ladder (added to colors.css in M9)
 * rather than borrowing status semantics. See the visual-identity
 * proposal for the reasoning.
 */
export function TierBadge({ label, colorVar, mutedVar }: TierBadgeProps) {
  return (
    <span
      className={`ds-text-caption ${styles.badge}`}
      style={{ color: `var(${colorVar})`, background: `var(${mutedVar})` }}
    >
      {label}
    </span>
  )
}
