import { useOutletContext } from 'react-router-dom'
import { Button, Card, EmptyState, RecipientOption } from '../../design-system/components'
import { corridors } from '../../mocks/corridors'
import type { Beneficiary, PayoutMethod } from '../../mocks/beneficiaries'
import type { AppOutletContext } from '../AppShell'
import styles from './Beneficiaries.module.css'

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

/**
 * M17 — the first real add-flow in the app. Every other "Add" affordance
 * in this codebase (AddRecipient) is intentionally decorative; this one
 * actually appends to state. Still fully mocked: additions live only in
 * this session's component state, nothing persists past a reload, per
 * "mocked data only" — this isn't a scope gap, it's the same rule
 * applied to a screen that now has a real form instead of a stub button.
 *
 * M28 — the add form itself moved to AddBeneficiaryModal, owned by
 * App.tsx like the other global modals, so "Add beneficiary" opens the
 * same modal instance from here or from Dashboard's Quick Send card.
 */
export function Beneficiaries() {
  const { beneficiaries, onAddBeneficiaryClick } = useOutletContext<AppOutletContext>()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className="ds-text-h1">Beneficiaries</span>
        <Button variant="primary" onClick={onAddBeneficiaryClick}>
          Add beneficiary
        </Button>
      </div>

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
