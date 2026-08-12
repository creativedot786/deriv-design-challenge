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

  const openSendMoney = () => setActiveModal('sendMoney')

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell onSendMoneyClick={openSendMoney} beneficiaries={beneficiaries} onAddBeneficiary={addBeneficiary} />}>
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
