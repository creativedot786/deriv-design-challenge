/**
 * Remittance providers. Connection status is fully simulated per the
 * product discovery doc: this is a concept demo, not a live integration,
 * so "connected" looks and behaves real even though no provider exposes
 * actual account-linking today (see Risks in the discovery doc).
 *
 * 3 of 4 providers connected by default — presentation-ready, not a
 * fresh/empty account. Lulu stays not-connected so the "connect to
 * unlock" state has something real to demo.
 */

export type ProviderStatus = 'connected' | 'not_connected' | 'failed' | 'unavailable'

export interface Provider {
  id: string
  name: string
  shortName: string
  initials: string
  status: ProviderStatus
  lastSyncedLabel: string
  supportedCorridorIds: string[]
}

export const providers: Provider[] = [
  {
    id: 'p-alansari',
    name: 'Al Ansari Exchange',
    shortName: 'Al Ansari',
    initials: 'AA',
    status: 'connected',
    lastSyncedLabel: '2 min ago',
    supportedCorridorIds: ['c-in', 'c-ph', 'c-pk'],
  },
  {
    id: 'p-alfardan',
    name: 'Al Fardan Exchange',
    shortName: 'Al Fardan',
    initials: 'AF',
    status: 'connected',
    lastSyncedLabel: '6 min ago',
    supportedCorridorIds: ['c-in', 'c-ph', 'c-pk'],
  },
  {
    id: 'p-uaeexchange',
    name: 'UAE Exchange',
    shortName: 'UAE Exchange',
    initials: 'UE',
    status: 'connected',
    lastSyncedLabel: '14 min ago',
    supportedCorridorIds: ['c-in', 'c-pk'],
  },
  {
    id: 'p-lulu',
    name: 'Lulu Exchange',
    shortName: 'Lulu',
    initials: 'LE',
    status: 'not_connected',
    lastSyncedLabel: 'Never connected',
    supportedCorridorIds: ['c-in', 'c-ph', 'c-pk'],
  },
]

export const connectedProviderCount = providers.filter((p) => p.status === 'connected').length
