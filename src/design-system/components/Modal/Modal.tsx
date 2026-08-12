import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from './Modal.module.css'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  /** Used for aria-label — the modal's accessible name. */
  label: string
  children: ReactNode
  /** 'wide' is for content that benefits from a multi-column layout (RateCheckerModal's fields-beside-results) — everything else stays at the original single-column width. */
  size?: 'default' | 'wide'
}

/** Must match .overlay/.panel's transition-duration in Modal.module.css — this is how long the exit animation is given to finish before the modal actually unmounts. */
const EXIT_DURATION_MS = 200

/**
 * M25 — was an instant show/hide (`if (!isOpen) return null`), which
 * read as "too instant" per direct feedback. `shouldRender` keeps the
 * panel mounted for one exit-transition's worth of time after `isOpen`
 * goes false, instead of yanking it off screen; `isVisible` is delayed
 * a frame on the way in so the panel actually paints in its closed
 * state before transitioning to open — applying the open class in the
 * same tick as mounting skips the transition entirely.
 */
export function Modal({ isOpen, onClose, label, children, size = 'default' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(isOpen)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // A plain rAF can get throttled/skipped in a backgrounded or
      // just-created tab and never fire, leaving the panel stuck at
      // opacity 0 — a short timeout is the more reliable "next paint"
      // signal across browser contexts.
      const timer = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timer)
    }
    setIsVisible(false)
    const timer = setTimeout(() => setShouldRender(false), EXIT_DURATION_MS)
    return () => clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    panelRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!shouldRender) return null

  return (
    <div
      className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ''}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={`${styles.panel} ${size === 'wide' ? styles.panelWide : ''} ${isVisible ? styles.panelVisible : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        {/* M28 — sheet drag-handle affordance, mobile only (see the
            @media block in Modal.module.css). No drag-to-dismiss gesture
            behind it — closing still goes through the existing X/overlay-
            tap paths, this is purely the visual cue that it's a sheet. */}
        <span className={styles.sheetHandle} aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
