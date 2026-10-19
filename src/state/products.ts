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

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p_ankara_wrap',
    name: 'Ankara Wrap Maxi Dress',
    description:
      'Vibrant 100% cotton wax print wrap dress with adjustable waist tie and pockets. Perfect for events and casual outings.',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'p_adire_silk_shirt',
    name: 'Adire Silk Camp Collar Shirt',
    description: 'Hand-dyed Abeokuta indigo Adire pattern on breathable silk blend. Relaxed fit.',
    price: 14000,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'p_leather_slides',
    name: 'Handcrafted Leather Slides',
    description: 'Genuine Nigerian leather slides with cushioned arch support and textured rubber sole.',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'p_beaded_tote',
    name: 'Woven Raffia Beaded Tote Bag',
    description: 'Handwoven raffia bag with wooden handles and delicate glass bead accents.',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    inStock: true,
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5,
  },
];

let products: Product[] = load();
const listeners = new Set<() => void>();

function load(): Product[] {
  const raw = readItem(STORAGE_KEY);
  if (!raw) return SAMPLE_PRODUCTS;
  try {
    const parsed = JSON.parse(raw) as Product[];
    return parsed.length > 0 ? parsed : SAMPLE_PRODUCTS;
  } catch {
    return SAMPLE_PRODUCTS;
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

export function clearProducts() {
  notify([]);
}

export function deleteProduct(id: string) {
  notify(products.filter((p) => p.id !== id));
}

export function toggleProductStock(id: string) {
  notify(products.map((p) => (p.id === id ? { ...p, inStock: !p.inStock, updatedAt: Date.now() } : p)));
}
