import { useEffect, useState } from 'react'
import { AmountInput, ComparisonRow, CountrySelector, Modal, SegmentedControl } from '../../design-system/components'
import { corridors } from '../../mocks/corridors'
import type { Provider } from '../../mocks/providers'
import { rankProviderRates } from '../../mocks/rates'
import styles from './RateCheckerModal.module.css'

export interface RateCheckerModalProps {
  isOpen: boolean
  onClose: () => void
  providers: Provider[]
  defaultCorridorId: string
}

const DEFAULT_AMOUNT = '200.00'

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/**
 * M27 — replaces the old "You send" / "They get" pair. That second
 * field always showed one number (the top-ranked provider's amount) as
 * if it were *the* answer, when the whole point of this modal is that
 * every provider gives a different amount — direct feedback flagged
 * this as actively misleading, not just a layout issue. Now there's one
 * field and a toggle for which currency it's denominated in; the actual
 * per-provider amounts only ever appear in the results list below,
 * where they're correctly attributed to a specific provider.
 */
export function RateCheckerModal({ isOpen, onClose, providers, defaultCorridorId }: RateCheckerModalProps) {
  const [direction, setDirection] = useState<'send' | 'receive'>('send')
  const [rawAmount, setRawAmount] = useState(DEFAULT_AMOUNT)
  const [corridorId, setCorridorId] = useState(defaultCorridorId)

  useEffect(() => {
    if (isOpen) {
      setDirection('send')
      setRawAmount(DEFAULT_AMOUNT)
      setCorridorId(defaultCorridorId)
    }
  }, [isOpen, defaultCorridorId])

  const corridor = corridors.find((c) => c.id === corridorId)!
  const rawNumeric = Number.parseFloat(rawAmount)
  // Mid-market rate is the stable reference for this conversion — not
  // any one provider's rate, which would create a circular "which
  // provider sets the amount that ranks the providers" problem.
  const sendAmountAed =
    direction === 'send' ? rawNumeric : Number.isNaN(rawNumeric) ? Number.NaN : rawNumeric / corridor.midMarketRate
  const isValid = !Number.isNaN(sendAmountAed) && sendAmountAed > 0

  const ranked = isValid ? rankProviderRates(corridorId, sendAmountAed, providers) : []

  // A different corridor invalidates a "receive" amount (it was
  // denominated in the old corridor's currency) — restarting from a
  // clean "send" default is simpler and safer than guessing a
  // conversion the user never actually asked for.
  const handleCorridorChange = (id: string) => {
    setCorridorId(id)
    setDirection('send')
    setRawAmount(DEFAULT_AMOUNT)
  }

  // Converts the current number across currencies when the toggle
  // flips, so the field stays roughly continuous instead of jumping to
  // a stale figure that meant something else a moment ago.
  const handleDirectionChange = (next: 'send' | 'receive') => {
    if (next === direction) return
    const numeric = Number.parseFloat(rawAmount)
    if (!Number.isNaN(numeric)) {
      const converted = next === 'receive' ? numeric * corridor.midMarketRate : numeric / corridor.midMarketRate
      setRawAmount(converted.toFixed(2))
    }
    setDirection(next)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Check today's rates" size="wide">
      <div className={styles.content}>
        <div className={styles.header}>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
          <p className="ds-text-h2">Check today's rates</p>
        </div>

        {/* M25 — two columns instead of one long stack: fields stay in
            view on the left while only the results scroll on the right,
            instead of the whole modal needing to scroll just to see
            past the 3rd provider. Collapses to a single column below
            640px, same as the app-shell's own breakpoint pattern. */}
        <div className={styles.layout}>
          <div className={styles.controls}>
            <CountrySelector
              label="Receiving in"
              options={corridors.map((c) => ({ id: c.id, countryName: c.countryName, currencyCode: c.currencyCode, flag: c.flag }))}
              value={corridorId}
              onChange={handleCorridorChange}
            />

            <SegmentedControl
              aria-label="Amount currency"
              value={direction}
              onChange={handleDirectionChange}
              options={[
                { value: 'send', label: 'Sending AED' },
                { value: 'receive', label: `Receiving ${corridor.currencyCode}` },
              ]}
            />

            <AmountInput
              value={rawAmount}
              currencyLabel={direction === 'send' ? 'AED' : corridor.currencyCode}
              errorText={!isValid ? 'Enter an amount' : undefined}
              onChange={(e) => setRawAmount(e.target.value)}
            />
          </div>

          <div className={styles.results}>
            {ranked.map(({ rate, provider, quote, isMostReceived, isFastest }) => {
              const rankLabel =
                isMostReceived && isFastest ? 'Most received · Fastest' : isMostReceived ? 'Most received' : isFastest ? 'Fastest' : undefined
              return (
                <ComparisonRow
                  key={provider.id}
                  providerName={provider.name}
                  providerInitials={provider.initials}
                  isConnected={provider.status === 'connected'}
                  recipientReceivesLabel={quote ? `${corridor.currencySymbol}${quote.recipientReceives.toFixed(2)}` : '—'}
                  rateLabel={`1 AED = ${rate.exchangeRate} ${corridor.currencyCode}`}
                  feeLabel={rate.feeAed === 0 ? 'No fee' : `AED ${rate.feeAed} fee`}
                  rankLabel={rankLabel}
                />
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}
