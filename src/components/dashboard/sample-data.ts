// Placeholder figures until orders come from the backend.
export type OrderStatus = 'new' | 'paid' | 'delivered';

export type Order = {
  id: string;
  customer: string;
  items: number;
  time: string;
  amount: number;
  status: OrderStatus;
};

export const TODAY = {
  sales: 48500,
  changeVsYesterday: 12,
  newOrders: 3,
  storeVisits: 128,
};

export const RECENT_ORDERS: Order[] = [
  { id: '1042', customer: 'Adaeze Okafor', items: 2, time: '10:24 AM', amount: 18500, status: 'new' },
  { id: '1041', customer: 'Tunde Bakare', items: 1, time: '9:02 AM', amount: 12000, status: 'new' },
  { id: '1040', customer: 'Kemi Adeyemi', items: 3, time: '8:15 AM', amount: 18000, status: 'paid' },
  { id: '1039', customer: 'Chuka Eze', items: 1, time: 'Yesterday', amount: 9500, status: 'delivered' },
];
