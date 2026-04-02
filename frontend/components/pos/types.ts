export type OrderType = "Delivery" | "Takeaway" | "Dine-In";

export type TableStatus = "Available" | "Occupied" | "Billing";

export type PaymentMethod = "UPI" | "Cash";

export interface TableNode {
  id: string;
  name: string;
  seats: number;
  top: string;
  left: string;
  width: string;
  height: string;
  status: TableStatus;
  shape?: "round" | "rounded";
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  badge: string;
}

export interface BillItem extends MenuItem {
  quantity: number;
}

export interface ReceiptData {
  orderId: string;
  orderType: OrderType;
  tableLabel: string;
  paymentMethod: PaymentMethod;
  issuedAt: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
}