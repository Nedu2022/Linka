import { useSyncExternalStore } from 'react';

import { readItem, writeItem } from '@/state/storage';

export type VendorProfile = {
  fullName: string;
  email: string;
  /** National number without the +234 prefix, e.g. "8031234567". */
  phone: string;
};

const STORAGE_KEY = 'vendor-profile';

let profile: VendorProfile | null = load();
const listeners = new Set<() => void>();

function load(): VendorProfile | null {
  const raw = readItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VendorProfile;
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function saveVendorProfile(next: VendorProfile) {
  profile = next;
  writeItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

export function getVendorProfile() {
  return profile;
}

export function useVendorProfile() {
  return useSyncExternalStore(subscribe, () => profile);
}
