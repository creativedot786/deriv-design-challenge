import styles from './Avatar.module.css'

export interface AvatarProps {
  initials: string
  /** Fixed pixel size — not a spacing token (avatars are an accepted exception). Default 36. */
  size?: number
}

export function Avatar({ initials, size = 36 }: AvatarProps) {
  return (
    <span
      className={`${styles.avatar} ds-text-caption`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
