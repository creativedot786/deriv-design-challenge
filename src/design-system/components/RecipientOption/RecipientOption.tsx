import { Avatar } from '../Avatar'
import styles from './RecipientOption.module.css'

export interface RecipientOptionProps {
  initials: string
  name: string
  meta: string
  selected?: boolean
  onClick?: () => void
}

export function RecipientOption({ initials, name, meta, selected = false, onClick }: RecipientOptionProps) {
  const classes = [styles.option, selected ? styles.selected : ''].filter(Boolean).join(' ')

  return (
    <button type="button" className={classes} onClick={onClick} aria-pressed={selected}>
      <Avatar initials={initials} />
      <div className={styles.mid}>
        <span className={`ds-text-label ${styles.name}`}>{name}</span>
        <span className={`ds-text-caption ${styles.meta}`}>{meta}</span>
      </div>
    </button>
  )
}

export interface AddRecipientProps {
  /** Static affordance by design — no working add-recipient flow. Don't wire this up unless explicitly asked. */
  onClick?: () => void
}

export function AddRecipient({ onClick }: AddRecipientProps) {
  return (
    <button type="button" className={styles.addRow} onClick={onClick}>
      <span className={styles.addIcon} aria-hidden="true">
        +
      </span>
      <span className="ds-text-label">Add new recipient</span>
    </button>
  )
}
