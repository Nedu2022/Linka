import { useSyncExternalStore } from 'react';

import { readItem, writeItem } from '@/state/storage';

export type OrderStatus = 'pending' | 'paid' | 'delivered';

export type OrderItem = { name: string; quantity: number; price: number };

export type Order = {
  id: string;
  /** Per-store order number shown to vendor and customer. */
  number: number;
  customer: { name: string; phone: string };
  items: OrderItem[];
  deliveryFee: number;
  delivery: { method: 'delivery' | 'pickup'; address: string };
  note: string;
  status: OrderStatus;
  createdAt: number;
  paidAt: number | null;
  deliveredAt: number | null;
};

const STORAGE_KEY = 'orders';
const HOUR = 60 * 60 * 1000;

let orders: Order[] = load();
const listeners = new Set<() => void>();

function load(): Order[] {
  const raw = readItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Order[];
    } catch {
      // Fall through to the sample orders.
    }
  }
  return sampleOrders(Date.now());
}

function update(next: Order[]) {
  orders = next;
  writeItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOrders() {
  return useSyncExternalStore(subscribe, () => orders);
}

export function useOrder(id: string | undefined) {
  return useSyncExternalStore(subscribe, () => orders.find((order) => order.id === id) ?? null);
}

export function usePendingOrderCount() {
  return useSyncExternalStore(subscribe, () => orders.filter((order) => order.status === 'pending').length);
}

export function getOrder(id: string | undefined): Order | null {
  if (!id) return null;
  return orders.find((order) => order.id === id) ?? null;
}

export function createOrder(data: {
  customer: { name: string; phone: string };
  items: OrderItem[];
  deliveryFee: number;
  delivery: { method: 'delivery' | 'pickup'; address: string };
  note: string;
  status: OrderStatus;
}): Order {
  const highestNumber = orders.reduce((max, o) => Math.max(max, o.number), 1046);
  const nextNumber = highestNumber + 1;
  const newOrder: Order = {
    ...data,
    id: `o_${nextNumber}`,
    number: nextNumber,
    createdAt: Date.now(),
    paidAt: data.status === 'paid' ? Date.now() : null,
    deliveredAt: null,
  };
  update([newOrder, ...orders]);
  return newOrder;
}

export function markOrderPaid(id: string) {
  const now = Date.now();
  update(orders.map((order) => (order.id === id ? { ...order, status: 'paid', paidAt: now } : order)));
}

export function markOrderDelivered(id: string) {
  const now = Date.now();
  update(orders.map((order) => (order.id === id ? { ...order, status: 'delivered', deliveredAt: now } : order)));
}

export function clearOrders() {
  update([]);
}

export function orderTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + order.deliveryFee;
}

export function orderItemCount(order: Order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

// Placeholder orders until they come from the backend, dated relative to first launch.
function sampleOrders(now: number): Order[] {
  const at = (hoursAgo: number) => now - hoursAgo * HOUR;
  const lagos = (street: string) => ({ method: 'delivery' as const, address: `${street}, Lagos` });
  return [
    {
      id: 'o_1046',
      number: 1046,
      customer: { name: 'Adaeze Okafor', phone: '8030000146' },
      items: [
        { name: 'Ankara wrap dress', quantity: 1, price: 15000 },
        { name: 'Matching headwrap', quantity: 1, price: 3500 },
      ],
      deliveryFee: 2500,
      delivery: lagos('14 Admiralty Way, Lekki'),
      note: 'Please call before delivery.',
      status: 'pending',
      createdAt: at(0.4),
      paidAt: null,
      deliveredAt: null,
    },
    {
      id: 'o_1045',
      number: 1045,
      customer: { name: 'Tunde Bakare', phone: '8030000145' },
      items: [{ name: 'Adire shirt', quantity: 1, price: 12000 }],
      deliveryFee: 0,
      delivery: { method: 'pickup', address: 'Pickup from store' },
      note: '',
      status: 'pending',
      createdAt: at(1.6),
      paidAt: null,
      deliveredAt: null,
    },
    {
      id: 'o_1044',
      number: 1044,
      customer: { name: 'Kemi Adeyemi', phone: '8030000144' },
      items: [
        { name: 'Aso-oke gele', quantity: 2, price: 6500 },
        { name: 'Beaded clutch', quantity: 1, price: 5000 },
      ],
      deliveryFee: 2000,
      delivery: lagos('22 Allen Avenue, Ikeja'),
      note: '',
      status: 'paid',
      createdAt: at(3),
      paidAt: at(2.8),
      deliveredAt: null,
    },
    {
      id: 'o_1043',
      number: 1043,
      customer: { name: 'Ibrahim Musa', phone: '8030000143' },
      items: [{ name: 'Kaftan, navy', quantity: 1, price: 22000 }],
      deliveryFee: 3000,
      delivery: lagos('5 Bourdillon Road, Ikoyi'),
      note: 'Size XL',
      status: 'paid',
      createdAt: at(5),
      paidAt: at(4.9),
      deliveredAt: null,
    },
    {
      id: 'o_1042',
      number: 1042,
      customer: { name: 'Chuka Eze', phone: '8030000142' },
      items: [{ name: 'Lace fabric, 5 yards', quantity: 1, price: 9500 }],
      deliveryFee: 1500,
      delivery: lagos('3 Herbert Macaulay Way, Yaba'),
      note: '',
      status: 'delivered',
      createdAt: at(27),
      paidAt: at(26.8),
      deliveredAt: at(20),
    },
    {
      id: 'o_1041',
      number: 1041,
      customer: { name: 'Funmi Ogunleye', phone: '8030000141' },
      items: [{ name: 'Ankara wrap dress', quantity: 2, price: 15000 }],
      deliveryFee: 2500,
      delivery: lagos('9 Awolowo Road, Ikoyi'),
      note: '',
      status: 'delivered',
      createdAt: at(52),
      paidAt: at(51.5),
      deliveredAt: at(30),
    },
    {
      id: 'o_1040',
      number: 1040,
      customer: { name: 'Bola Ahmed', phone: '8030000140' },
      items: [{ name: 'Adire shirt', quantity: 1, price: 12000 }],
      deliveryFee: 0,
      delivery: { method: 'pickup', address: 'Pickup from store' },
      note: '',
      status: 'delivered',
      createdAt: at(76),
      paidAt: at(75),
      deliveredAt: at(74),
    },
  ];
}
