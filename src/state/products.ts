import { useSyncExternalStore } from 'react';

import { readItem, writeItem } from '@/state/storage';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  inStock: boolean;
  createdAt: number;
  updatedAt: number;
};

export type ProductDraft = {
  name: string;
  description: string;
  price: number;
  image: string | null;
  inStock: boolean;
};

const STORAGE_KEY = 'products';

let products: Product[] = load();
const listeners = new Set<() => void>();

function load(): Product[] {
  const raw = readItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

function notify(next: Product[]) {
  products = next;
  writeItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProducts() {
  return useSyncExternalStore(subscribe, () => products);
}

export function useProduct(id: string | undefined) {
  return useSyncExternalStore(subscribe, () => (id ? (products.find((p) => p.id === id) ?? null) : null));
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id) ?? null;
}

export function saveProduct(draft: ProductDraft, id?: string) {
  const now = Date.now();
  if (id) {
    const existing = products.find((p) => p.id === id);
    if (!existing) return id;
    notify(products.map((p) => (p.id === id ? { ...p, ...draft, updatedAt: now } : p)));
    return id;
  }

  const nextId = `p_${now.toString(36)}`;
  notify([{ id: nextId, ...draft, createdAt: now, updatedAt: now }, ...products]);
  return nextId;
}

export function saveProducts(drafts: ProductDraft[]) {
  if (drafts.length === 0) return [] as string[];
  const now = Date.now();
  const created: Product[] = drafts.map((draft, index) => ({
    id: `p_${(now + index).toString(36)}`,
    ...draft,
    createdAt: now + index,
    updatedAt: now + index,
  }));
  notify([...created, ...products]);
  return created.map((p) => p.id);
}

export function deleteProduct(id: string) {
  notify(products.filter((p) => p.id !== id));
}

export function toggleProductStock(id: string) {
  notify(products.map((p) => (p.id === id ? { ...p, inStock: !p.inStock, updatedAt: Date.now() } : p)));
}
