import { useSyncExternalStore } from 'react';

import { type Product } from '@/state/products';
import { readItem, writeItem } from '@/state/storage';

export type CartItem = {
  product: Product;
  quantity: number;
};

const STORAGE_KEY = 'customer_cart';

let items: CartItem[] = load();
const listeners = new Set<() => void>();

function load(): CartItem[] {
  const raw = readItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

function update(next: CartItem[]) {
  items = next;
  writeItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCart() {
  return useSyncExternalStore(subscribe, () => items);
}

export function addToCart(product: Product, quantity = 1) {
  const existing = items.find((item) => item.product.id === product.id);
  if (existing) {
    update(
      items.map((item) =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      )
    );
  } else {
    update([...items, { product, quantity }]);
  }
}

export function updateQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  update(items.map((item) => (item.product.id === productId ? { ...item, quantity } : item)));
}

export function removeFromCart(productId: string) {
  update(items.filter((item) => item.product.id !== productId));
}

export function clearCart() {
  update([]);
}

export function getCartTotal() {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function getCartItemCount() {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

