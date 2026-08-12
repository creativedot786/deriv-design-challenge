import { Avatar } from '../Avatar'
import styles from './QuickSendItem.module.css'

export interface QuickSendItemProps {
  initials: string
  name: string
  /** Flag emoji, shown beside the name — M26, so a favorite's destination is visible without opening Send Money. */
  flag: string
  onClick?: () => void
}

export function QuickSendItem({ initials, name, flag, onClick }: QuickSendItemProps) {
  return (
    <button type="button" className={styles.item} onClick={onClick}>
      <Avatar initials={initials} size={48} />
      <span className={`ds-text-caption ${styles.name}`}>
        <span aria-hidden="true">{flag}</span> {name}
      </span>
    </button>
  )
}
