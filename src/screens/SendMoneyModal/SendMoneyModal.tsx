import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AddRecipient,
  AmountInput,
  Button,
  ComparisonRow,
  FundingMethodCard,
  Modal,
  ProgressMeter,
  RecipientOption,
  SegmentedControl,
  TotalBlock,
} from '../../design-system/components'
import { corridors, defaultCorridorId } from '../../mocks/corridors'
import type { Provider } from '../../mocks/providers'
import { providerRate, providerRates, quoteFor } from '../../mocks/rates'
import type { Beneficiary } from '../../mocks/beneficiaries'
import { fundingMethods } from '../../mocks/fundingMethods'
import { currentUserTierProgress, tierById } from '../../mocks/tiers'
import styles from './SendMoneyModal.module.css'

export interface SendMoneyModalProps {
  isOpen: boolean
  onClose: () => void
  /**
   * Owned by App.tsx (M17) — the same list the Beneficiaries screen
   * reads/writes, so a beneficiary added there shows up here without a
   * reload. Passed as a prop rather than imported directly from the mock
   * file, unlike every other read-only mock source in this component.
   */
  beneficiaries: Beneficiary[]
  /** Same reasoning as beneficiaries, added in M18 — connecting a provider on the Providers screen must be reflected here immediately. */
  providers: Provider[]
  /** Called when the user hits Send — parent transitions to the Success modal. */
  onComplete: (details: {
    recipientName: string
    amount: string
    providerName: string
    countryName: string
    recipientReceivesLabel: string
  }) => void
}

type Step = 'amount' | 'beneficiary' | 'compare' | 'review'
type SortBy = 'amount' | 'fast' | 'cheap'

const STEP_INDEX: Record<Step, number> = { amount: 1, beneficiary: 2, compare: 3, review: 4 }
const TOTAL_STEPS = 4
const DEFAULT_AMOUNT = '500.00'

function payoutMethodLabel(method: 'bank' | 'cash_pickup' | 'mobile_wallet'): string {
  if (method === 'bank') return 'Bank transfer'
  if (method === 'cash_pickup') return 'Cash pickup'
  return 'Mobile wallet'
}

function beneficiaryMeta(b: Beneficiary): string {
  if (b.bank) return `${payoutMethodLabel(b.payoutMethod)} · ${b.bank.bankName} ${b.bank.accountNumberMasked}`
  if (b.mobileWallet) return `${payoutMethodLabel(b.payoutMethod)} · ${b.mobileWallet.walletProvider} ${b.mobileWallet.numberMasked}`
  if (b.cashPickup) return `${payoutMethodLabel(b.payoutMethod)} · ${b.cashPickup.branchNetwork}`
  return payoutMethodLabel(b.payoutMethod)
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
)

/**
 * M19 — every step's header, not just a repeated block: a persistent
 * close (X), always available, plus a back arrow only where there's
 * somewhere to go back to (never on step 1). Replaces the old pattern
 * where step 1 had a "← Send money" back-arrow-labeled link that
 * actually closed the modal — a mislabeled affordance, not a real back
 * action. The progress bar reuses ProgressMeter (M14) instead of a
 * plain "Step X of 4" text label standing alone.
 */
function StepHeader({
  title,
  step,
  onBack,
  onClose,
}: {
  title: string
  step: Step
  onBack?: () => void
  onClose: () => void
}) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        {onBack ? (
          <button type="button" className={styles.iconButton} onClick={onBack} aria-label="Back">
            <BackIcon />
          </button>
        ) : (
          <span />
        )}
        <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <ProgressMeter value={(STEP_INDEX[step] / TOTAL_STEPS) * 100} />
      <p className="ds-text-h2">{title}</p>
    </div>
  )
}

/**
 * M19 rework of the M15/16 flow: Amount -> Beneficiary -> Compare
 * -> Review, was Amount+Destination -> Compare -> Beneficiary -> Review.
 * The destination corridor is now derived from whichever beneficiary
 * gets picked, instead of asked as its own step — most people send to
 * one fixed corridor repeatedly, so a standalone country selector on
 * every send was friction for a decision that's usually already implied
 * by "who am I paying." Removing it also means one fewer thing to ask
 * before the comparison — the part of this product that's actually
 * differentiated.
 */
export function SendMoneyModal({ isOpen, onClose, onComplete, beneficiaries, providers }: SendMoneyModalProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)
  const [sortBy, setSortBy] = useState<SortBy>('amount')
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null)
  const [selectedFundingId, setSelectedFundingId] = useState(
    fundingMethods.find((f) => f.isDefault)?.id ?? fundingMethods[0]?.id,
  )
  const [isSending, setIsSending] = useState(false)

  // Reset to a clean first step every time the modal is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setStep('amount')
      setAmount(DEFAULT_AMOUNT)
      setSortBy('amount')
      setSelectedProviderId(null)
      setSelectedBeneficiaryId(null)
      setSelectedFundingId(fundingMethods.find((f) => f.isDefault)?.id ?? fundingMethods[0]?.id)
      setIsSending(false)
    }
  }, [isOpen])

  const numericAmount = Number.parseFloat(amount)
  const isZeroOrInvalid = Number.isNaN(numericAmount) || numericAmount <= 0

  const selectedBeneficiary = beneficiaries.find((b) => b.id === selectedBeneficiaryId)
  // Only meaningful once a beneficiary is chosen — the compare/review
  // steps guard on selectedBeneficiary existing before rendering.
  const corridorId = selectedBeneficiary?.corridorId ?? defaultCorridorId
  const corridor = corridors.find((c) => c.id === corridorId)!

  const corridorRates = useMemo(() => providerRates.filter((r) => r.corridorId === corridorId), [corridorId])

  const rows = useMemo(() => {
    return corridorRates
      .map((rate) => {
        const provider = providers.find((p) => p.id === rate.providerId)!
        const quote = !isZeroOrInvalid ? quoteFor(rate.providerId, corridorId, numericAmount) : undefined
        const totalCostAed = quote ? rate.feeAed + quote.spreadAed : rate.feeAed
        return { rate, provider, quote, totalCostAed }
      })
      .filter((r) => r.provider)
  }, [corridorRates, corridorId, numericAmount, isZeroOrInvalid, providers])

  const mostReceivedProviderId = useMemo(() => {
    const withQuote = rows.filter((r) => r.quote)
    if (withQuote.length === 0) return null
    return withQuote.reduce((best, r) => (r.quote!.recipientReceives > best.quote!.recipientReceives ? r : best)).provider.id
  }, [rows])

  const fastestProviderId = useMemo(() => {
    if (rows.length === 0) return null
    return rows.reduce((best, r) => (r.rate.deliveryMinutesEstimate < best.rate.deliveryMinutesEstimate ? r : best)).provider.id
  }, [rows])

  const sortedRows = useMemo(() => {
    const copy = [...rows]
    if (sortBy === 'fast') copy.sort((a, b) => a.rate.deliveryMinutesEstimate - b.rate.deliveryMinutesEstimate)
    else if (sortBy === 'cheap') copy.sort((a, b) => a.totalCostAed - b.totalCostAed)
    else copy.sort((a, b) => (b.quote?.recipientReceives ?? 0) - (a.quote?.recipientReceives ?? 0))
    return copy
  }, [rows, sortBy])

  const selectedRate = selectedProviderId ? providerRate(selectedProviderId, corridorId) : undefined
  const selectedProvider = selectedProviderId ? providers.find((p) => p.id === selectedProviderId) : undefined
  const selectedQuote = selectedProviderId && !isZeroOrInvalid ? quoteFor(selectedProviderId, corridorId, numericAmount) : undefined

  const tier = tierById(currentUserTierProgress.tierId)
  const cashbackAed = tier.cashbackPercent > 0 ? (numericAmount * tier.cashbackPercent) / 100 : 0

  const handleSelectProvider = (providerId: string, isConnected: boolean) => {
    if (!isConnected) {
      onClose()
      navigate('/providers')
      return
    }
    setSelectedProviderId(providerId)
    setStep('review')
  }

  const handleSend = () => {
    if (!selectedProvider || !selectedBeneficiary || !selectedQuote) return
    setIsSending(true)
    // Simulates a network round-trip — no backend, but the loading
    // state on Send is real, not just a static prop.
    setTimeout(() => {
      onComplete({
        recipientName: selectedBeneficiary.name,
        amount: `AED ${numericAmount.toFixed(2)}`,
        providerName: selectedProvider.name,
        countryName: corridor.countryName,
        recipientReceivesLabel: `${corridor.currencySymbol}${selectedQuote.recipientReceives.toFixed(2)}`,
      })
    }, 700)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Send money">
      <div className={styles.content}>
        {step === 'amount' && (
          <>
            <StepHeader title="Send money" step="amount" onClose={onClose} />

            <AmountInput
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText="Sent from your linked AED funding source"
              errorText={isZeroOrInvalid ? 'Enter an amount to send' : undefined}
            />

            <Button variant="primary" fullWidth disabled={isZeroOrInvalid} onClick={() => setStep('beneficiary')}>
              Continue
            </Button>
          </>
        )}

        {step === 'beneficiary' && (
          <>
            <StepHeader title="Choose beneficiary" step="beneficiary" onBack={() => setStep('amount')} onClose={onClose} />
            <div className={styles.recipientList}>
              {beneficiaries.map((b) => {
                const c = corridors.find((corr) => corr.id === b.corridorId)!
                return (
                  <RecipientOption
                    key={b.id}
                    initials={b.initials}
                    name={`${c.flag} ${b.name}`}
                    meta={`${c.countryName} · ${beneficiaryMeta(b)}`}
                    selected={b.id === selectedBeneficiaryId}
                    onClick={() => {
                      setSelectedBeneficiaryId(b.id)
                      setSelectedProviderId(null)
                      setStep('compare')
                    }}
                  />
                )
              })}
              <AddRecipient />
            </div>
          </>
        )}

        {step === 'compare' && selectedBeneficiary && (
          <>
            <StepHeader title="Compare providers" step="compare" onBack={() => setStep('beneficiary')} onClose={onClose} />
            <p className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              Sending AED {numericAmount.toFixed(2)} to {selectedBeneficiary.name} in {corridor.countryName}
            </p>

            <SegmentedControl
              aria-label="Sort providers by"
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'amount', label: 'Recipient gets most' },
                { value: 'fast', label: 'Fastest' },
                { value: 'cheap', label: 'Lowest cost' },
              ]}
            />

            <div className={styles.compareList}>
              {sortedRows.map(({ rate, provider, quote }) => {
                const isConnected = provider.status === 'connected'
                const isMostReceived = provider.id === mostReceivedProviderId
                const isFastest = provider.id === fastestProviderId
                const rankLabel =
                  isMostReceived && isFastest
                    ? 'Most received · Fastest'
                    : isMostReceived
                      ? 'Most received'
                      : isFastest
                        ? 'Fastest'
                        : undefined
                const providerCashback = isConnected && tier.cashbackPercent > 0 ? (numericAmount * tier.cashbackPercent) / 100 : 0

                return (
                  <ComparisonRow
                    key={provider.id}
                    providerName={provider.name}
                    providerInitials={provider.initials}
                    isConnected={isConnected}
                    recipientReceivesLabel={quote ? `${corridor.currencySymbol}${quote.recipientReceives.toFixed(2)}` : '—'}
                    rateLabel={`1 AED = ${rate.exchangeRate} ${corridor.currencyCode}`}
                    feeLabel={rate.feeAed === 0 ? 'No fee' : `AED ${rate.feeAed} fee`}
                    deliveryEtaLabel={rate.deliveryEtaLabel}
                    asOfLabel={rate.asOfLabel}
                    rankLabel={rankLabel}
                    cashbackLabel={providerCashback > 0 ? `+ AED ${providerCashback.toFixed(2)} cashback` : undefined}
                    onAction={() => handleSelectProvider(provider.id, isConnected)}
                  />
                )
              })}
            </div>
          </>
        )}

        {step === 'review' && selectedProvider && selectedRate && selectedBeneficiary && selectedQuote && (
          <>
            <StepHeader title="Review & send" step="review" onBack={() => setStep('compare')} onClose={onClose} />

            <div className={styles.chip}>
              <div className={styles.chipMid}>
                <span className={`ds-text-label ${styles.chipName}`}>{selectedBeneficiary.name}</span>
                <span className={`ds-text-caption ${styles.chipMeta}`}>
                  via {selectedProvider.name} · {corridor.currencySymbol}
                  {selectedQuote.recipientReceives.toFixed(2)}
                </span>
              </div>
              <Button variant="link" onClick={() => setStep('beneficiary')}>
                Change
              </Button>
            </div>

            <div className={styles.fundingList}>
              <p className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
                Pay with
              </p>
              {fundingMethods.map((f) => (
                <FundingMethodCard
                  key={f.id}
                  type={f.type}
                  label={f.label}
                  detail={f.detail}
                  isDefault={f.isDefault}
                  selected={f.id === selectedFundingId}
                  onClick={() => setSelectedFundingId(f.id)}
                />
              ))}
            </div>

            <TotalBlock total={`AED ${numericAmount.toFixed(2)}`} onBreakdownClick={() => setStep('compare')} />
            {cashbackAed > 0 && (
              <p className="ds-text-caption" style={{ color: 'var(--text-savings)' }}>
                + AED {cashbackAed.toFixed(2)} cashback after this transfer
              </p>
            )}

            <Button variant="primary" fullWidth onClick={handleSend} isLoading={isSending}>
              Send
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
