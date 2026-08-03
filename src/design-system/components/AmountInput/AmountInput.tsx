import type { ChangeEvent, InputHTMLAttributes } from 'react'
import styles from './AmountInput.module.css'

export interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  helperText?: string
}

/** Strips everything except digits and a single decimal point. */
function sanitizeAmount(raw: string): string {
  const digitsAndDots = raw.replace(/[^0-9.]/g, '')
  const firstDot = digitsAndDots.indexOf('.')
  if (firstDot === -1) return digitsAndDots
  return (
    digitsAndDots.slice(0, firstDot + 1) + digitsAndDots.slice(firstDot + 1).replace(/\./g, '')
  )
}

export function AmountInput({ helperText, onChange, ...rest }: AmountInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeAmount(event.target.value)
    if (sanitized !== event.target.value) {
      event.target.value = sanitized
    }
    onChange?.(event)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={`ds-text-display ${styles.currency}`}>$</span>
        <input
          className={`${styles.input} ds-text-display-xl`}
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          aria-label="Amount to send"
          onChange={handleChange}
          {...rest}
        />
      </div>
      {helperText && <span className={`ds-text-caption ${styles.helper}`}>{helperText}</span>}
    </div>
  )
}
