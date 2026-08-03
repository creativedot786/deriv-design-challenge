import type { InputHTMLAttributes } from 'react'
import styles from './AmountInput.module.css'

export interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  helperText?: string
}

export function AmountInput({ helperText, ...rest }: AmountInputProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={`ds-text-display ${styles.currency}`}>$</span>
        <input
          className={`${styles.input} ds-text-display-xl`}
          inputMode="decimal"
          aria-label="Amount to send"
          {...rest}
        />
      </div>
      {helperText && <span className={`ds-text-caption ${styles.helper}`}>{helperText}</span>}
    </div>
  )
}
