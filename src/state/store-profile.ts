import { useSyncExternalStore } from 'react';

import { type StoreCategory } from '@/components/store/categories';
import { readItem, writeItem } from '@/state/storage';

export type StoreProfile = {
  name: string;
  slug: string;
  category: StoreCategory;
  description: string;
  logo: string | null;
  verified: boolean;
};

const STORAGE_KEY = 'store-profile';

// Saved on the device until there's a backend, so a reload lands back on the dashboard.
let profile: StoreProfile | null = load();
const listeners = new Set<() => void>();

function load(): StoreProfile | null {
  const raw = readItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoreProfile;
  } catch {
    return null;
  }
}

function update(next: StoreProfile | null) {
  profile = next;
  writeItem(STORAGE_KEY, next ? JSON.stringify(next) : null);
  listeners.forEach((listener) => listener());
}

export function saveStoreProfile(next: StoreProfile) {
  update(next);
}

export function markStoreVerified() {
  if (!profile) return;
  update({ ...profile, verified: true });
}

export function clearStoreProfile() {
  update(null);
}

export function getStoreProfile() {
  return profile;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const FALLBACK: StoreProfile = {
  name: 'Mama Tee Fabrics',
  slug: 'mama-tee-fabrics',
  category: 'Fashion',
  description: 'Quality Ankara and lace, delivered across Lagos.',
  logo: null,
  verified: false,
};

export function useStoreProfile() {
  return useSyncExternalStore(subscribe, () => profile ?? FALLBACK);
}

export function storeInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}
