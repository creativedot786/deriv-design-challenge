import { useEffect, useState } from 'react'
import { AmountInput, ComparisonRow, CountrySelector, Modal } from '../../design-system/components'
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

const SwapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

/**
 * M24 — split out of the M23 Home hero, which inlined this whole tool
 * onto the dashboard and buried the page under it. Home goes back to a
 * one-line teaser ("Compare rates" link); this modal is where the actual
 * swap/country-independent rate check lives, matching how Send Money's
 * own comparison step already opens as a modal rather than a page. Not
 * tied to a beneficiary on purpose — "just checking" is a different job
 * than "about to send," which is also why it's a separate modal from
 * SendMoneyModal rather than a new step bolted onto that flow.
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
  // Editing "They get" back-calculates AED using the corridor's
  // mid-market rate as a stable reference — not any one provider's rate,
  // which would create a circular "which provider sets the amount that
  // ranks the providers" problem.
  const sendAmountAed =
    direction === 'send' ? rawNumeric : Number.isNaN(rawNumeric) ? Number.NaN : rawNumeric / corridor.midMarketRate
  const isValid = !Number.isNaN(sendAmountAed) && sendAmountAed > 0

  const ranked = isValid ? rankProviderRates(corridorId, sendAmountAed, providers) : []
  const topReceive = ranked[0]?.quote?.recipientReceives

  const sendDisplay = direction === 'send' ? rawAmount : isValid ? sendAmountAed.toFixed(2) : '0.00'
  const receiveDisplay = direction === 'receive' ? rawAmount : topReceive !== undefined ? topReceive.toFixed(2) : '0.00'

  // Preserves whatever's currently on screen when flipping which side is
  // editable, instead of resetting to a stale raw number that meant
  // something different in the other currency.
  const handleSwap = () => {
    if (direction === 'send') {
      setRawAmount(receiveDisplay)
      setDirection('receive')
    } else {
      setRawAmount(sendDisplay)
      setDirection('send')
    }
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
              onChange={setCorridorId}
            />

            <div className={styles.fields}>
              <div className={styles.field}>
                <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
                  You send
                </span>
                <AmountInput
                  value={sendDisplay}
                  currencyLabel="AED"
                  onChange={(e) => {
                    setDirection('send')
                    setRawAmount(e.target.value)
                  }}
                />
              </div>

              <button type="button" className={styles.swapButton} onClick={handleSwap} aria-label="Switch which amount you're entering">
                <SwapIcon />
              </button>

              <div className={styles.field}>
                <span className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
                  They get
                </span>
                <AmountInput
                  value={receiveDisplay}
                  currencyLabel={corridor.currencyCode}
                  onChange={(e) => {
                    setDirection('receive')
                    setRawAmount(e.target.value)
                  }}
                />
              </div>
            </div>
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
