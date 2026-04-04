export type OrderType = "Delivery" | "Takeaway" | "Dine-In";
export type SectionType = "AC" | "Non-AC" | "Rooftop";
export type PaymentType = "None" | "Cash" | "UPI" | "Split" | "Card" | "Due" | "Other";
export type TableStatus = "Available" | "Occupied" | "Cleaning" | "Reserved";

export type SplitPayment = {
  cash: number;
  upi: number;
};

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

export type DeliveryAddress = {
  flatNo: string;
  roomNo: string;
  landmark: string;
  autoLocation: string;
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
  persons: number;
  tableId: string | null;
  deliveryAddress: DeliveryAddress | null;
  payment: PaymentType;
  splitPayment: SplitPayment | null;
  items: OrderItem[];
  settled: boolean;
  paymentStatus: "pending" | "paid";
  preparationStatus: "pending" | "prepared";
  unpaidAmountCleared: boolean;
};

export type MenuItem = {
  id: string;
  token: string;
  name: string;
  price: number;
  tag: string;
  isActive?: boolean;
};

export type Palette = Record<string, string>;
