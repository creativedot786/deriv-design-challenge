import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  title: string
  subtext?: string
  icon?: ReactNode
}

export function EmptyState({ title, subtext, icon }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <p className="ds-text-label">{title}</p>
      {subtext && <p className={`ds-text-body ${styles.subtext}`}>{subtext}</p>}
    </div>
  )
}
