import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  /** Fully round — for avatar-shaped placeholders. */
  circle?: boolean
  /** Use on a dark surface (e.g. inside the Spotlight card) — default tone is invisible there. */
  inverse?: boolean
}

export function Skeleton({ width = '100%', height = 16, circle = false, inverse = false }: SkeletonProps) {
  const classes = [styles.skeleton, inverse ? styles.inverse : ''].filter(Boolean).join(' ')
  return (
    <span
      className={classes}
      style={{ width, height, borderRadius: circle ? '50%' : undefined }}
      aria-hidden="true"
    />
  )
}
