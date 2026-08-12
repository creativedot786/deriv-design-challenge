import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './screens/AppShell'
import { Dashboard } from './screens/Dashboard'
import { Beneficiaries } from './screens/Beneficiaries'
import { Providers } from './screens/Providers'
import { Activity } from './screens/Activity'
import { Profile } from './screens/Profile'
import { SendMoneyModal } from './screens/SendMoneyModal'
import { SuccessModal } from './screens/SuccessModal'
import { beneficiaries as initialBeneficiaries } from './mocks/beneficiaries'
import type { Beneficiary } from './mocks/beneficiaries'
import { providers as initialProviders } from './mocks/providers'
import type { Provider, ProviderStatus } from './mocks/providers'

type ActiveModal = 'sendMoney' | 'success' | null

function App() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [completedTransfer, setCompletedTransfer] = useState<{
    recipientName: string
    amount: string
    providerName: string
    countryName: string
    recipientReceivesLabel: string
  } | null>(null)
  // Single source of truth for beneficiaries, lifted here in M17 so the
  // Beneficiaries screen and the Send Money flow never drift into two
  // separate lists — see AppShell's AppOutletContext doc comment.
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(initialBeneficiaries)
  const addBeneficiary = (beneficiary: Beneficiary) => setBeneficiaries((prev) => [beneficiary, ...prev])

  // Single source of truth for provider connection state, lifted here in
  // M18 for the same reason as beneficiaries above — the Providers
  // screen and the Send Money comparison step must agree on who's
  // connected.
  const [providers, setProviders] = useState<Provider[]>(initialProviders)
  const updateProviderStatus = (providerId: string, status: ProviderStatus) =>
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId
          ? { ...p, status, lastSyncedLabel: status === 'connected' ? 'Just now' : status === 'not_connected' ? 'Never connected' : p.lastSyncedLabel }
          : p,
      ),
    )

  const openSendMoney = () => setActiveModal('sendMoney')

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AppShell
              onSendMoneyClick={openSendMoney}
              beneficiaries={beneficiaries}
              onAddBeneficiary={addBeneficiary}
              providers={providers}
              onUpdateProviderStatus={updateProviderStatus}
            />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="beneficiaries" element={<Beneficiaries />} />
          <Route path="providers" element={<Providers />} />
          <Route path="activity" element={<Activity />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>

      <SendMoneyModal
        isOpen={activeModal === 'sendMoney'}
        beneficiaries={beneficiaries}
        providers={providers}
        onClose={() => setActiveModal(null)}
        onComplete={(details) => {
          setCompletedTransfer(details)
          setActiveModal('success')
        }}
      />

      <SuccessModal
        isOpen={activeModal === 'success'}
        onClose={() => setActiveModal(null)}
        recipientName={completedTransfer?.recipientName ?? ''}
        amount={completedTransfer?.amount ?? ''}
        providerName={completedTransfer?.providerName ?? ''}
        countryName={completedTransfer?.countryName ?? ''}
        recipientReceivesLabel={completedTransfer?.recipientReceivesLabel ?? ''}
      />
    </BrowserRouter>
  )
}

export default App
