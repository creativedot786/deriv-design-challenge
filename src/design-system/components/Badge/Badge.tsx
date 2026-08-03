import type { ReactNode } from 'react'
import styles from './Badge.module.css'

export type BadgeKind = 'success' | 'warning' | 'error' | 'neutral'
export type BadgeVariant = 'quiet' | 'pill'

export interface BadgeProps {
  kind: BadgeKind
  /** 'quiet' (default) for in-context status; 'pill' reserved for standalone emphasis. */
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({ kind, variant = 'quiet', children }: BadgeProps) {
  const classes = [styles.badge, styles[kind], variant === 'pill' ? styles.pill : '', 'ds-text-caption']
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  )
}
