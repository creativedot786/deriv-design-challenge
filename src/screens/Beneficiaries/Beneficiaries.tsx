import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Button,
  Card,
  CountrySelector,
  EmptyState,
  Input,
  Modal,
  RecipientOption,
  SegmentedControl,
  Select,
} from '../../design-system/components'
import { corridors } from '../../mocks/corridors'
import { banksForCorridor } from '../../mocks/banks'
import type { Beneficiary, PayoutMethod } from '../../mocks/beneficiaries'
import type { AppOutletContext } from '../AppShell'
import styles from './Beneficiaries.module.css'

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

function payoutMethodLabel(method: PayoutMethod): string {
  if (method === 'bank') return 'Bank transfer'
  if (method === 'cash_pickup') return 'Cash pickup'
  return 'Mobile wallet'
}

function metaFor(b: Beneficiary): string {
  if (b.bank) return `${payoutMethodLabel(b.payoutMethod)} · ${b.bank.bankName} ${b.bank.accountNumberMasked}`
  if (b.mobileWallet) return `${payoutMethodLabel(b.payoutMethod)} · ${b.mobileWallet.walletProvider} ${b.mobileWallet.numberMasked}`
  if (b.cashPickup) return `${payoutMethodLabel(b.payoutMethod)} · ${b.cashPickup.branchNetwork}`
  return payoutMethodLabel(b.payoutMethod)
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

interface DraftForm {
  name: string
  corridorId: string
  payoutMethod: PayoutMethod
  bankName: string
  accountNumber: string
  ifsc: string
  walletProvider: string
  walletNumber: string
  pickupLocation: string
}

const emptyDraft: DraftForm = {
  name: '',
  corridorId: corridors[0].id,
  payoutMethod: 'bank',
  bankName: '',
  accountNumber: '',
  ifsc: '',
  walletProvider: '',
  walletNumber: '',
  pickupLocation: '',
}

/**
 * M17 — the first real add-flow in the app. Every other "Add" affordance
 * in this codebase (AddRecipient) is intentionally decorative; this one
 * actually appends to state. Still fully mocked: additions live only in
 * this session's component state, nothing persists past a reload, per
 * "mocked data only" — this isn't a scope gap, it's the same rule
 * applied to a screen that now has a real form instead of a stub button.
 */
export function Beneficiaries() {
  const { beneficiaries, onAddBeneficiary } = useOutletContext<AppOutletContext>()
  const [isAdding, setIsAdding] = useState(false)
  const [draft, setDraft] = useState<DraftForm>(emptyDraft)

  const corridor = corridors.find((c) => c.id === draft.corridorId)!
  const showIfsc = corridor.countryCode === 'IN'

  const isValid =
    draft.name.trim().length > 0 &&
    (draft.payoutMethod === 'bank'
      ? draft.bankName.trim().length > 0 && draft.accountNumber.trim().length > 0
      : draft.payoutMethod === 'mobile_wallet'
        ? draft.walletProvider.trim().length > 0 && draft.walletNumber.trim().length > 0
        : draft.pickupLocation.trim().length > 0)

  const resetForm = () => {
    setDraft(emptyDraft)
    setIsAdding(false)
  }

  const handleAdd = () => {
    if (!isValid) return
    const newBeneficiary: Beneficiary = {
      id: `b-${Date.now()}`,
      name: draft.name.trim(),
      initials: initialsFor(draft.name.trim()),
      corridorId: draft.corridorId,
      payoutMethod: draft.payoutMethod,
      isFavorite: false,
      ...(draft.payoutMethod === 'bank' && {
        bank: {
          bankName: draft.bankName.trim(),
          accountNumberMasked: `•••• ${draft.accountNumber.trim().slice(-4)}`,
          ...(showIfsc && draft.ifsc.trim() ? { ifsc: draft.ifsc.trim() } : {}),
        },
      }),
      ...(draft.payoutMethod === 'mobile_wallet' && {
        mobileWallet: { walletProvider: draft.walletProvider.trim(), numberMasked: `•••• ${draft.walletNumber.trim().slice(-4)}` },
      }),
      ...(draft.payoutMethod === 'cash_pickup' && {
        cashPickup: { branchNetwork: draft.pickupLocation.trim() },
      }),
    }
    onAddBeneficiary(newBeneficiary)
    resetForm()
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className="ds-text-h1">Beneficiaries</span>
        <Button variant="primary" onClick={() => setIsAdding(true)}>
          Add beneficiary
        </Button>
      </div>

      <Modal isOpen={isAdding} onClose={resetForm} label="Add beneficiary">
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <p className="ds-text-h2">New beneficiary</p>
            <button type="button" className={styles.iconButton} onClick={resetForm} aria-label="Close">
              <CloseIcon />
            </button>
          </div>

          <Input
            label="Full name"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="e.g. Amara Khan"
          />

          <CountrySelector
            label="Destination country"
            options={corridors.map((c) => ({ id: c.id, countryName: c.countryName, currencyCode: c.currencyCode, flag: c.flag }))}
            value={draft.corridorId}
            // Bank options are per-country — a bank picked under the old
            // country wouldn't be a real option under the new one, so
            // clear it here rather than carry over a value that's about
            // to disappear from the dropdown.
            onChange={(id) => setDraft((d) => ({ ...d, corridorId: id, bankName: '' }))}
          />

          <div className={styles.field}>
            <span className={`ds-text-label ${styles.fieldLabel}`}>Payout method</span>
            <SegmentedControl
              aria-label="Payout method"
              value={draft.payoutMethod}
              onChange={(v) => setDraft((d) => ({ ...d, payoutMethod: v }))}
              options={[
                { value: 'bank', label: 'Bank transfer' },
                { value: 'cash_pickup', label: 'Cash pickup' },
                { value: 'mobile_wallet', label: 'Mobile wallet' },
              ]}
            />
          </div>

          {draft.payoutMethod === 'bank' && (
            <>
              <Select
                label="Bank name"
                placeholder="Select a bank"
                value={draft.bankName}
                onChange={(e) => setDraft((d) => ({ ...d, bankName: e.target.value }))}
                options={banksForCorridor(draft.corridorId).map((name) => ({ value: name, label: name }))}
              />
              <Input
                label="Account number"
                value={draft.accountNumber}
                onChange={(e) => setDraft((d) => ({ ...d, accountNumber: e.target.value }))}
                inputMode="numeric"
              />
              {showIfsc && (
                <Input
                  label="IFSC code (optional)"
                  value={draft.ifsc}
                  onChange={(e) => setDraft((d) => ({ ...d, ifsc: e.target.value }))}
                  placeholder="e.g. HDFC0001234"
                />
              )}
            </>
          )}

          {draft.payoutMethod === 'mobile_wallet' && (
            <>
              <Input
                label="Wallet provider"
                value={draft.walletProvider}
                onChange={(e) => setDraft((d) => ({ ...d, walletProvider: e.target.value }))}
                placeholder="e.g. GCash"
              />
              <Input
                label="Wallet number"
                value={draft.walletNumber}
                onChange={(e) => setDraft((d) => ({ ...d, walletNumber: e.target.value }))}
                inputMode="numeric"
              />
            </>
          )}

          {draft.payoutMethod === 'cash_pickup' && (
            <Input
              label="Preferred pickup location"
              value={draft.pickupLocation}
              onChange={(e) => setDraft((d) => ({ ...d, pickupLocation: e.target.value }))}
              placeholder="e.g. Al Ansari branch network"
            />
          )}

          <div className={styles.formActions}>
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!isValid} onClick={handleAdd}>
              Save beneficiary
            </Button>
          </div>
        </div>
      </Modal>

      {beneficiaries.length === 0 ? (
        <Card variant="flat">
          <EmptyState icon={<PeopleIcon />} title="No beneficiaries yet" subtext="Add one to start sending." />
        </Card>
      ) : (
        <Card variant="elevated" className={styles.listCard}>
          {beneficiaries.map((b) => {
            const c = corridors.find((corr) => corr.id === b.corridorId)!
            return (
              <RecipientOption
                key={b.id}
                variant="listItem"
                initials={b.initials}
                name={`${c.flag} ${b.name}`}
                meta={`${c.countryName} · ${metaFor(b)}`}
              />
            )
          })}
        </Card>
      )}
    </div>
  )
}
