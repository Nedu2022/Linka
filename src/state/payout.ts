import { useSyncExternalStore } from 'react';

import { readItem, writeItem } from '@/state/storage';
import { getVendorProfile } from '@/state/vendor-profile';

export type PayoutAccount = {
  bankId: string;
  bankName: string;
  /** 10-digit NUBAN. */
  accountNumber: string;
  accountName: string;
};

export const ACCOUNT_NUMBER_LENGTH = 10;

const STORAGE_KEY = 'payout-account';

let account: PayoutAccount | null = load();
const listeners = new Set<() => void>();

function load(): PayoutAccount | null {
  const raw = readItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PayoutAccount;
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function savePayoutAccount(next: PayoutAccount) {
  account = next;
  writeItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function usePayoutAccount() {
  return useSyncExternalStore(subscribe, () => account);
}

/**
 * Looks up the name on a bank account.
 *
 * Placeholder until there's a backend: it echoes the vendor's profile name. Replace with a server call
 * to a resolve-account endpoint (e.g. Paystack `GET /bank/resolve`) — never call that from the app directly,
 * since it needs a secret key.
 */
export async function resolveAccountName(_bankId: string, _accountNumber: string): Promise<string | null> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  const name = getVendorProfile()?.fullName.trim();
  return name ? name.toUpperCase() : null;
}

export function maskAccountNumber(accountNumber: string) {
  return `•••• ${accountNumber.slice(-4)}`;
}
