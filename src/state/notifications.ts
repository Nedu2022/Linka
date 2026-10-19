import { useSyncExternalStore } from 'react';

import { readItem, writeItem } from '@/state/storage';

export type NotificationKind = 'order' | 'payment' | 'payout' | 'stock';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  /** Order to open when the notification is tapped. */
  orderId?: string;
};

export type NotificationPrefs = Record<NotificationKind, boolean>;

const LIST_KEY = 'notifications';
const PREFS_KEY = 'notification-prefs';
const HOUR = 60 * 60 * 1000;

const DEFAULT_PREFS: NotificationPrefs = { order: true, payment: true, payout: true, stock: true };

let items: AppNotification[] = loadList();
let prefs: NotificationPrefs = loadPrefs();
const listeners = new Set<() => void>();

function loadList(): AppNotification[] {
  const raw = readItem(LIST_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as AppNotification[];
    } catch {
      // Fall through to the samples.
    }
  }
  return sampleNotifications(Date.now());
}

function loadPrefs(): NotificationPrefs {
  const raw = readItem(PREFS_KEY);
  if (!raw) return DEFAULT_PREFS;
  try {
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

function setItems(next: AppNotification[]) {
  items = next;
  writeItem(LIST_KEY, JSON.stringify(next));
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNotifications() {
  return useSyncExternalStore(subscribe, () => items);
}

export function useUnreadCount() {
  return useSyncExternalStore(subscribe, () => items.filter((item) => !item.read).length);
}

export function markNotificationRead(id: string) {
  if (items.some((item) => item.id === id && !item.read)) {
    setItems(items.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }
}

export function markAllNotificationsRead() {
  setItems(items.map((item) => (item.read ? item : { ...item, read: true })));
}

export function clearNotifications() {
  setItems([]);
}

export function addNotification(data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
  const newNotif: AppNotification = {
    ...data,
    id: `n_${Date.now()}`,
    createdAt: Date.now(),
    read: false,
  };
  setItems([newNotif, ...items]);
}

export function useNotificationPrefs() {
  return useSyncExternalStore(subscribe, () => prefs);
}

export function setNotificationPref(kind: NotificationKind, enabled: boolean) {
  prefs = { ...prefs, [kind]: enabled };
  writeItem(PREFS_KEY, JSON.stringify(prefs));
  notify();
}

// Placeholder notifications until push notifications come from the backend.
function sampleNotifications(now: number): AppNotification[] {
  const at = (hoursAgo: number) => now - hoursAgo * HOUR;
  return [
    {
      id: 'n_6',
      kind: 'order',
      title: 'New order #1046',
      body: 'Adaeze Okafor ordered 2 items. Waiting for payment.',
      createdAt: at(0.4),
      read: false,
      orderId: 'o_1046',
    },
    {
      id: 'n_5',
      kind: 'order',
      title: 'New order #1045',
      body: 'Tunde Bakare ordered an Adire shirt for pickup.',
      createdAt: at(1.6),
      read: false,
      orderId: 'o_1045',
    },
    {
      id: 'n_4',
      kind: 'payment',
      title: 'Payment received for #1044',
      body: 'Kemi Adeyemi paid ₦20,000. Time to pack the order.',
      createdAt: at(2.8),
      read: false,
      orderId: 'o_1044',
    },
    {
      id: 'n_3',
      kind: 'stock',
      title: 'Ankara wrap dress is selling fast',
      body: 'You have sold 3 this week. Check your stock.',
      createdAt: at(8),
      read: true,
    },
    {
      id: 'n_2',
      kind: 'payout',
      title: 'Payout sent',
      body: '₦11,000 was sent to your bank account.',
      createdAt: at(26),
      read: true,
    },
    {
      id: 'n_1',
      kind: 'payment',
      title: 'Payment received for #1042',
      body: 'Chuka Eze paid ₦11,000.',
      createdAt: at(26.8),
      read: true,
      orderId: 'o_1042',
    },
  ];
}
