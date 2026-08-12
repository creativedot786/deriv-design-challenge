/**
 * Bank directories per corridor — backs the Add Beneficiary form's bank
 * dropdown (M25). A free-text bank name field let users type anything;
 * a real remittance provider only pays out to banks it actually has
 * rails to, so this is a closed, per-country list, same reasoning as
 * corridors.ts being a fixed 3 destinations rather than open text.
 */

export const banksByCorridor: Record<string, string[]> = {
  'c-in': ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank'],
  'c-ph': ['BDO Unibank', 'Bank of the Philippine Islands', 'Metrobank', 'Land Bank of the Philippines'],
  'c-pk': ['Habib Bank Limited', 'United Bank Limited', 'MCB Bank', 'Allied Bank'],
}

export function banksForCorridor(corridorId: string): string[] {
  return banksByCorridor[corridorId] ?? []
}
