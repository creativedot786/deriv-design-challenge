import { Badge, Button, Card, Modal } from '../../design-system/components'
import styles from './SuccessModal.module.css'

export interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  recipientName: string
  amount: string
}

const today = new Date()
const dateLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const timeLabel = today.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const CheckIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="4 12 9 17 20 6" />
  </svg>
)

export function SuccessModal({ isOpen, onClose, recipientName, amount }: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Transfer sent">
      <div className={styles.content}>
        <div className={styles.center}>
          <span className={styles.icon}>
            <CheckIcon />
          </span>
          <p className="ds-text-h1">Transfer sent</p>
          <p className={`ds-text-body ${styles.subtext}`}>
            {amount} sent to {recipientName}
          </p>
        </div>

        <Card variant="elevated" className={styles.receipt}>
          <div className={styles.row}>
            <span className={`ds-text-body ${styles.rowLabel}`}>Recipient</span>
            <span className="ds-text-label">{recipientName}</span>
          </div>
          <div className={styles.row}>
            <span className={`ds-text-body ${styles.rowLabel}`}>Amount</span>
            <span className="ds-text-label">{amount}</span>
          </div>
          <div className={styles.row}>
            <span className={`ds-text-body ${styles.rowLabel}`}>Date</span>
            <span className="ds-text-label">
              {dateLabel}, {timeLabel}
            </span>
          </div>
          <div className={styles.row}>
            <span className={`ds-text-body ${styles.rowLabel}`}>Status</span>
            <Badge kind="success" variant="pill">
              Completed
            </Badge>
          </div>
        </Card>

        <div className={styles.actions}>
          <Button variant="primary" fullWidth onClick={onClose}>
            Done
          </Button>
          <Button variant="link" onClick={() => console.log('View receipt clicked')}>
            View receipt
          </Button>
        </div>
      </div>
    </Modal>
  )
}
