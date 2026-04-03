export type OrderType = "Delivery" | "Takeaway" | "Dine-In";
export type SectionType = "AC" | "Non-AC" | "Rooftop";
export type PaymentType = "Cash" | "Card" | "UPI";
export type TableStatus = "Available" | "Occupied";

export type TableNode = {
  id: string;
  label: string;
  status: TableStatus;
};

export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export type ActiveOrder = {
  id: string;
  customer: string;
  type: OrderType;
  amount: number;
  itemCount: number;
  elapsed: string;
};

export type BillOrder = ActiveOrder & {
  mobile: string;
  section: SectionType;
  tableId: string | null;
  payment: PaymentType;
  items: OrderItem[];
  settled: boolean;
  paymentStatus: "pending" | "paid";
  preparationStatus: "pending" | "prepared";
  unpaidAmountCleared: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  tag: string;
};

export type Palette = Record<string, string>;
