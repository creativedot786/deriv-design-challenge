import { useState } from 'react'
import { Dashboard } from './screens/Dashboard'
import { SendMoneyModal } from './screens/SendMoneyModal'
import { SuccessModal } from './screens/SuccessModal'

type ActiveModal = 'sendMoney' | 'success' | null

function App() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [completedTransfer, setCompletedTransfer] = useState<{ recipientName: string; amount: string } | null>(
    null,
  )

  return (
    <>
      <Dashboard onSendMoneyClick={() => setActiveModal('sendMoney')} />

      <SendMoneyModal
        isOpen={activeModal === 'sendMoney'}
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
      />
    </>
  )
}

export default App
