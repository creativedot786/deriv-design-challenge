import type { HTMLAttributes } from 'react'
import styles from './Card.module.css'

export type CardVariant = 'elevated' | 'flat' | 'spotlight'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 'elevated' (default) is the standard surface — shadow, no border.
   * 'flat' is for quiet grouping (no shadow/border at all).
   * 'spotlight' is the dark hero surface — reserve it for exactly one
   * moment per screen (e.g. the Dashboard balance card).
   */
  variant?: CardVariant
}

export function Card({ variant = 'elevated', className, children, ...rest }: CardProps) {
  const classes = [styles.card, styles[variant], className].filter(Boolean).join(' ')

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
