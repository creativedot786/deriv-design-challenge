import type { ChangeEvent, InputHTMLAttributes } from 'react'
import styles from './AmountInput.module.css'

export interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  helperText?: string
  /** Presence of an error message puts the field into its error state (red value + message). */
  errorText?: string
  /**
   * The sending currency label, e.g. "AED". Defaults to "AED" — RemitOne
   * sends from a UAE AED balance regardless of destination corridor.
   * Was a hardcoded "$" until M15/16; flagged in the product discovery
   * doc's audit as a real bug, fixed here where this component's actual
   * consumer (the rebuilt Send Money flow) needed it corrected anyway.
   */
  currencyLabel?: string
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

export function AmountInput({ helperText, errorText, currencyLabel = 'AED', onChange, value, ...rest }: AmountInputProps) {
  const isError = Boolean(errorText)
  const message = errorText ?? helperText

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
        <span className={`ds-text-display ds-font-display ${styles.currency}`}>{currencyLabel}</span>
        <input
          className={`${styles.input} ds-text-display-xl ds-font-display ${isError ? styles.inputError : ''}`}
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          aria-label="Amount to send"
          aria-invalid={isError || undefined}
          onChange={handleChange}
          value={value}
          // A bare <input> doesn't size itself to its value the way a
          // <div> would — `size` is what actually grows/shrinks the box
          // with the digit count (a 6-figure PKR amount needs more room
          // than "0.00"). CSS `max-width` alone left large numbers
          // clipped mid-digit — confirmed via scrollWidth > clientWidth
          // on an 8-character value in a 220px-capped box.
          size={Math.max(String(value ?? '').length, 1)}
          {...rest}
        />
      </div>
      {message && (
        <span className={`ds-text-caption ${styles.helper} ${isError ? styles.helperError : ''}`}>
          {message}
        </span>
      )}
    </div>
  )
}
