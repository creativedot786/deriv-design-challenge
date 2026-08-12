import styles from './ProgressMeter.module.css'

export interface ProgressMeterProps {
  /** 0–100. Values outside that range are clamped. */
  value: number
  /** e.g. "AED 6,200 of 20,000 to Silver" — rendered above the track. */
  label?: string
  /** CSS custom property name for the fill color. Defaults to brand. */
  colorVar?: string
}

/**
 * New in M14. No progress/meter primitive existed anywhere in the
 * system before — needed for tier progress on Home and Profile
 * (M19/M20), kept generic enough to reuse wherever else a bounded
 * progress value needs showing.
 */
export function ProgressMeter({ value, label, colorVar = '--bg-brand' }: ProgressMeterProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={styles.wrap}>
      {label && (
        <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.fill} style={{ width: `${clamped}%`, background: `var(${colorVar})` }} />
      </div>
    </div>
  )
}
