import { Avatar } from '../Avatar'
import styles from './QuickSendItem.module.css'

export type QuickSendItemProps =
  | { kind: 'person'; initials: string; name: string; onClick?: () => void }
  | { kind: 'add'; onClick?: () => void }

export function QuickSendItem(props: QuickSendItemProps) {
  if (props.kind === 'add') {
    return (
      <button type="button" className={styles.item} onClick={props.onClick}>
        <span className={styles.addCircle} aria-hidden="true">
          +
        </span>
        <span className={`ds-text-caption ${styles.name}`}>Add new</span>
      </button>
    )
  }

  return (
    <button type="button" className={styles.item} onClick={props.onClick}>
      <Avatar initials={props.initials} size={48} />
      <span className={`ds-text-caption ${styles.name}`}>{props.name}</span>
    </button>
  )
}
