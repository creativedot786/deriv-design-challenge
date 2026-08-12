import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AddRecipient,
  AmountInput,
  Button,
  ComparisonRow,
  CountrySelector,
  FundingMethodCard,
  Modal,
  RecipientOption,
  SegmentedControl,
  TotalBlock,
} from '../../design-system/components'
import { corridors, defaultCorridorId } from '../../mocks/corridors'
import { providers } from '../../mocks/providers'
import { providerRate, providerRates, quoteFor } from '../../mocks/rates'
import { beneficiariesForCorridor } from '../../mocks/beneficiaries'
import { fundingMethods } from '../../mocks/fundingMethods'
import { currentUserTierProgress, tierById } from '../../mocks/tiers'
import styles from './SendMoneyModal.module.css'

export interface SendMoneyModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called when the user hits Send — parent transitions to the Success modal. */
  onComplete: (details: {
    recipientName: string
    amount: string
    providerName: string
    countryName: string
    recipientReceivesLabel: string
  }) => void
}

type Step = 'amount' | 'compare' | 'beneficiary' | 'review'
type SortBy = 'amount' | 'fast' | 'cheap'

const DEFAULT_AMOUNT = '500.00'

function payoutMethodLabel(method: 'bank' | 'cash_pickup' | 'mobile_wallet'): string {
  if (method === 'bank') return 'Bank transfer'
  if (method === 'cash_pickup') return 'Cash pickup'
  return 'Mobile wallet'
}

export function SendMoneyModal({ isOpen, onClose, onComplete }: SendMoneyModalProps) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('amount')
  const [corridorId, setCorridorId] = useState(defaultCorridorId)
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
      setCorridorId(defaultCorridorId)
      setAmount(DEFAULT_AMOUNT)
      setSortBy('amount')
      setSelectedProviderId(null)
      setSelectedBeneficiaryId(null)
      setSelectedFundingId(fundingMethods.find((f) => f.isDefault)?.id ?? fundingMethods[0]?.id)
      setIsSending(false)
    }
  }, [isOpen])

  const corridor = corridors.find((c) => c.id === corridorId)!
  const numericAmount = Number.parseFloat(amount)
  const isZeroOrInvalid = Number.isNaN(numericAmount) || numericAmount <= 0

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
  }, [corridorRates, corridorId, numericAmount, isZeroOrInvalid])

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

  const corridorBeneficiaries = useMemo(() => beneficiariesForCorridor(corridorId), [corridorId])
  const selectedBeneficiary = corridorBeneficiaries.find((b) => b.id === selectedBeneficiaryId)

  const tier = tierById(currentUserTierProgress.tierId)
  const cashbackAed = tier.cashbackPercent > 0 ? (numericAmount * tier.cashbackPercent) / 100 : 0

  const handleCorridorChange = (id: string) => {
    setCorridorId(id)
    setSelectedProviderId(null)
    setSelectedBeneficiaryId(null)
  }

  const handleSelectProvider = (providerId: string, isConnected: boolean) => {
    if (!isConnected) {
      onClose()
      navigate('/providers')
      return
    }
    setSelectedProviderId(providerId)
    setStep('beneficiary')
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

  const stepIndex = { amount: 1, compare: 2, beneficiary: 3, review: 4 }[step]

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Send money">
      <div className={styles.content}>
        {step === 'amount' && (
          <>
            <button type="button" className={`ds-text-label ${styles.backButton}`} onClick={onClose}>
              ← Send money
            </button>
            <p className={`ds-text-label ${styles.stepHeading}`}>Step {stepIndex} of 4 — Amount &amp; destination</p>

            <CountrySelector
              label="Send to"
              options={corridors.map((c) => ({ id: c.id, countryName: c.countryName, currencyCode: c.currencyCode, flag: c.flag }))}
              value={corridorId}
              onChange={handleCorridorChange}
            />

            <AmountInput
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText={`Sent from your linked AED funding source`}
              errorText={isZeroOrInvalid ? 'Enter an amount to send' : undefined}
            />

            <Button variant="primary" fullWidth disabled={isZeroOrInvalid} onClick={() => setStep('compare')}>
              Compare providers
            </Button>
          </>
        )}

        {step === 'compare' && (
          <>
            <button type="button" className={`ds-text-label ${styles.backButton}`} onClick={() => setStep('amount')}>
              ← Amount &amp; destination
            </button>
            <p className={`ds-text-label ${styles.stepHeading}`}>Step {stepIndex} of 4 — Compare providers</p>
            <p className="ds-text-caption" style={{ color: 'var(--text-muted)' }}>
              Sending AED {numericAmount.toFixed(2)} to {corridor.countryName}
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

        {step === 'beneficiary' && (
          <>
            <button type="button" className={`ds-text-label ${styles.backButton}`} onClick={() => setStep('compare')}>
              ← Compare providers
            </button>
            <p className={`ds-text-label ${styles.stepHeading}`}>Step {stepIndex} of 4 — Choose beneficiary</p>
            <div className={styles.recipientList}>
              {corridorBeneficiaries.map((b) => (
                <RecipientOption
                  key={b.id}
                  initials={b.initials}
                  name={b.name}
                  meta={`${payoutMethodLabel(b.payoutMethod)}${b.bank ? ` · ${b.bank.bankName} ${b.bank.accountNumberMasked}` : ''}${b.mobileWallet ? ` · ${b.mobileWallet.walletProvider} ${b.mobileWallet.numberMasked}` : ''}`}
                  selected={b.id === selectedBeneficiaryId}
                  onClick={() => {
                    setSelectedBeneficiaryId(b.id)
                    setStep('review')
                  }}
                />
              ))}
              <AddRecipient />
            </div>
          </>
        )}

        {step === 'review' && selectedProvider && selectedRate && selectedBeneficiary && selectedQuote && (
          <>
            <button type="button" className={`ds-text-label ${styles.backButton}`} onClick={() => setStep('beneficiary')}>
              ← Choose beneficiary
            </button>
            <p className={`ds-text-label ${styles.stepHeading}`}>Step {stepIndex} of 4 — Review &amp; send</p>

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

            <TotalBlock
              total={`AED ${numericAmount.toFixed(2)}`}
              onBreakdownClick={() => setStep('compare')}
            />
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
