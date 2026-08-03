import { useEffect, useState } from 'react'
import {
  AddRecipient,
  Avatar,
  AmountInput,
  Button,
  Modal,
  RecipientOption,
  TotalBlock,
} from '../../design-system/components'
import { recipients } from '../../mocks/recipients'
import { currentUser } from '../../mocks/user'
import styles from './SendMoneyModal.module.css'

export interface SendMoneyModalProps {
  isOpen: boolean
  onClose: () => void
  /** Called when the user hits Send — parent transitions to the Success modal. */
  onComplete: (details: { recipientName: string; amount: string }) => void
}

type Step = 'recipient' | 'amount'

function formatCurrency(raw: string): string {
  const value = Number.parseFloat(raw)
  if (Number.isNaN(value)) return '$0.00'
  return `$${value.toFixed(2)}`
}

export function SendMoneyModal({ isOpen, onClose, onComplete }: SendMoneyModalProps) {
  const [step, setStep] = useState<Step>('recipient')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [amount, setAmount] = useState('250.00')

  // Reset to a clean first step every time the modal is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setStep('recipient')
      setSelectedId(null)
      setAmount('250.00')
    }
  }, [isOpen])

  const selectedRecipient = recipients.find((r) => r.id === selectedId)
  const total = formatCurrency(amount)

  const handleSend = () => {
    if (!selectedRecipient) return
    onComplete({ recipientName: selectedRecipient.name, amount: total })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Send money">
      <div className={styles.content}>
        {step === 'recipient' ? (
          <>
            <button type="button" className={`ds-text-label ${styles.backButton}`} onClick={onClose}>
              ← Send money
            </button>
            <p className={`ds-text-label ${styles.stepHeading}`}>Step 1 of 2 — Choose recipient</p>
            <div className={styles.recipientList}>
              {recipients.map((r) => (
                <RecipientOption
                  key={r.id}
                  initials={r.initials}
                  name={r.name}
                  meta={r.accountMeta}
                  selected={r.id === selectedId}
                  onClick={() => {
                    setSelectedId(r.id)
                    setStep('amount')
                  }}
                />
              ))}
              <AddRecipient />
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`ds-text-label ${styles.backButton}`}
              onClick={() => setStep('recipient')}
            >
              ← Choose recipient
            </button>

            {selectedRecipient && (
              <div className={styles.chip}>
                <Avatar initials={selectedRecipient.initials} />
                <div className={styles.chipMid}>
                  <span className={`ds-text-label ${styles.chipName}`}>{selectedRecipient.name}</span>
                  <span className={`ds-text-caption ${styles.chipMeta}`}>
                    {selectedRecipient.accountMeta}
                  </span>
                </div>
                <Button variant="link" onClick={() => setStep('recipient')}>
                  Change
                </Button>
              </div>
            )}

            <AmountInput
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText={`Available balance: ${currentUser.balance}`}
            />

            <TotalBlock total={total} onBreakdownClick={() => console.log('Breakdown clicked')} />

            <Button variant="primary" fullWidth onClick={handleSend}>
              Send
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
