import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  helperText?: string
  /** Presence of an error message puts the field into its error state. */
  errorText?: string
}

export function Input({
  label,
  helperText,
  errorText,
  disabled,
  className,
  ...rest
}: InputProps) {
  const id = useId()
  const isError = Boolean(errorText)
  const message = errorText ?? helperText
  const helperId = message ? `${id}-helper` : undefined

  const inputClasses = [styles.input, isError ? styles.error : '', 'ds-text-body-lg', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={`ds-text-label ${styles.label}`}>
        {label}
      </label>
      <input
        id={id}
        className={inputClasses}
        disabled={disabled}
        aria-invalid={isError || undefined}
        aria-describedby={helperId}
        {...rest}
      />
      {message && (
        <span
          id={helperId}
          className={`ds-text-caption ${styles.helper} ${isError ? styles.helperError : ''}`}
        >
          {message}
        </span>
      )}
    </div>
  )
}
