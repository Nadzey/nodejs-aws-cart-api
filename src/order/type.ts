export enum OrderStatus {
  Open = 'OPEN',
  Approved = 'APPROVED',
  Confirmed = 'CONFIRMED',
  Sent = 'SENT',
  Completed = 'COMPLETED',
  Cancelled = 'CANCELLED',
}

export type StatusHistory = Array<{
  status: OrderStatus;
  timestamp: number;
  comment: string;
}>;

export type Address = {
  address: string;
  firstName: string;
  lastName: string;
  comment: string;
};

export type Payment = {
  method: string;
  card_last4?: string;
  email?: string;
  amount: number;
};

export type Delivery = {
  address: string;
  city: string;
  zip: string;
};

export type CreateOrderDto = {
  items: Array<{ productId: string; count: number }>;
  address: Address;
};

export type PutCartPayload = {
  product: {
    description: string;
    id: string;
    title: string;
    price: number;
  };
  count: number;
};

export type CreateOrderPayload = {
  userId: string;
  cartId: string;
  items: Array<{ productId: string; count: number }>;
  address: Address;
  total: number;
  payment: Payment;
  delivery: Delivery;
  comments?: string;
};
