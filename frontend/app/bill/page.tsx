"use client";

import axios from "axios";
import {
  BarChart3,
  ClipboardList,
  Eye,
  FileText,
  IndianRupee,
  MoonStar,
  PieChart,
  RefreshCcw,
  Save,
  Settings,
  SunMedium,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActiveOrdersPanel } from "@/components/bill/ActiveOrdersPanel";
import { BillEditorPanel } from "@/components/bill/BillEditorPanel";
import { OrderHistoryPanel } from "@/components/bill/OrderHistoryPanel";
import { BillSidebar } from "@/components/bill/BillSidebar";
import { TableManagementModal } from "@/components/bill/TableManagementModal";
import type { BillOrder, MenuItem, OrderItem, OrderType, Palette, PaymentType, SectionType, SplitPayment, TableNode, TableStatus } from "@/components/bill/types";

type BackendMenuItem = {
  id?: string | number;
  name?: string;
  price?: number;
  tag?: string;
  category?: string;
  isActive?: boolean;
};

type BackendOrderItem = {
  id?: string | number;
  name?: string;
  qty?: number;
  category?: string;
  isActive?: boolean;
};

type BackendOrderItem = {
  id?: string | number;
  name?: string;
  qty?: number;
  quantity?: number;
  price?: number;
};

type BackendOrder = {
  id?: string | number;
  orderId?: string | number;
  customer?: string;
  customerName?: string;
  type?: string;
  orderType?: string;
  amount?: number;
  total?: number;
  itemCount?: number;
  elapsed?: string;
  mobile?: string;
  phone?: string;
  section?: string;
  persons?: number;
  tableId?: string;
  deliveryAddress?: {
    flatNo?: string;
    roomNo?: string;
    landmark?: string;
    autoLocation?: string;
  } | null;
  payment?: string;
  paymentType?: string;
  splitPayment?: {
    cash?: number;
    upi?: number;
  } | null;
  paymentStatus?: string;
  preparationStatus?: string;
  unpaidAmountCleared?: boolean;
  items?: BackendOrderItem[];
  settled?: boolean;
};

type BackendTable = {
  id?: string;
  tableId?: string;
  label?: string;
  status?: string;
  assignedOrderId?: string | null;
};

const POS_API_BASE_URL = process.env.NEXT_PUBLIC_POS_API_BASE_URL ?? "http://localhost:8000";

function normalizeOrderType(value: string | undefined): OrderType {
  if (value === "Delivery" || value === "Takeaway" || value === "Dine-In") {
    return value;
  }
  return "Dine-In";
}

function normalizePayment(value: string | undefined): PaymentType {
  if (value === "Cash" || value === "UPI" || value === "Split" || value === "Card" || value === "Due" || value === "Other") {
    return value;
  }
  return "None";
}

function normalizeSplitPayment(value: BackendOrder["splitPayment"]): SplitPayment | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const cash = Number(value.cash ?? 0);
  const upi = Number(value.upi ?? 0);
  return {
    cash: Number.isFinite(cash) && cash >= 0 ? cash : 0,
    upi: Number.isFinite(upi) && upi >= 0 ? upi : 0,
  };
}

function normalizeSection(value: string | undefined): SectionType {
  if (value === "AC" || value === "Non-AC" || value === "Rooftop") {
    return value;
  }
  return "AC";
}

function summarizeOrderItems(items: OrderItem[]) {
  const subtotal = items.reduce((acc, item) => acc + item.qty * item.price, 0);
  const tax = Math.round(subtotal * 0.05);
  return {
    amount: subtotal + tax,
    itemCount: items.reduce((acc, item) => acc + item.qty, 0),
  };
}

function mapMenuFromBackend(item: BackendMenuItem, index: number): MenuItem {
  const id = String(item.id ?? `api-menu-${index + 1}`);
  const name = item.name?.trim() || `Item ${index + 1}`;
  const price = typeof item.price === "number" ? item.price : 0;
  const tag = item.tag?.trim() || item.category?.trim() || "Food";
  const matchedToken = TOKEN_BY_MENU_NAME.get(name.toLowerCase());
  const token = matchedToken ?? `FD${String(index + 1).padStart(3, "0")}`;

  return { id, token, name, price, tag, isActive: item.isActive !== false };
}

const RESTAURANT_MENU_CATALOG: Array<{ token: string; name: string; price: number; tag: string }> = [
  { token: "FD101", name: "Paneer Tikka", price: 320, tag: "Tandoori" },
  { token: "FD102", name: "Hara Bhara Kabab", price: 280, tag: "Veggie" },
  { token: "FD103", name: "Veg Manchurian", price: 240, tag: "Indo-Chinese" },
  { token: "FD104", name: "Chilli Paneer", price: 290, tag: "Spicy" },
  { token: "FD105", name: "Crispy Corn", price: 220, tag: "Crunchy" },
  { token: "FD106", name: "Mushroom Duplex", price: 310, tag: "Chef Special" },
  { token: "FD107", name: "Dahi Ke Sholay", price: 260, tag: "Classic" },
  { token: "FD108", name: "Soya Chaap Tikka", price: 270, tag: "Protein" },
  { token: "FD109", name: "Aloo Tikki Chaat", price: 150, tag: "Street Food" },
  { token: "FD110", name: "Paneer 65", price: 280, tag: "Spicy" },
  { token: "FD111", name: "Chicken Tikka", price: 380, tag: "Tandoori" },
  { token: "FD112", name: "Murgh Malai Tikka", price: 410, tag: "Creamy" },
  { token: "FD113", name: "Chicken 65", price: 350, tag: "Spicy" },
  { token: "FD114", name: "Fish Amritsari", price: 450, tag: "Fried" },
  { token: "FD115", name: "Mutton Seekh Kabab", price: 480, tag: "Grill" },
  { token: "FD116", name: "Tandoori Chicken (Full)", price: 550, tag: "Classic" },
  { token: "FD117", name: "Chicken Lollipop", price: 320, tag: "Kids Choice" },
  { token: "FD118", name: "Garlic Butter Prawns", price: 580, tag: "Seafood" },
  { token: "FD119", name: "Chicken Seekh Kabab", price: 360, tag: "Grill" },
  { token: "FD120", name: "Afghani Chicken", price: 420, tag: "Mild" },
  { token: "FD121", name: "Dal Makhani", price: 280, tag: "Popular" },
  { token: "FD122", name: "Paneer Butter Masala", price: 340, tag: "Best Seller" },
  { token: "FD123", name: "Kadhai Paneer", price: 330, tag: "Spicy" },
  { token: "FD124", name: "Palak Paneer", price: 310, tag: "Healthy" },
  { token: "FD125", name: "Malai Kofta", price: 350, tag: "Creamy" },
  { token: "FD126", name: "Mix Vegetable", price: 260, tag: "Simple" },
  { token: "FD127", name: "Dal Tadka", price: 210, tag: "Basic" },
  { token: "FD128", name: "Chana Masala", price: 230, tag: "North Indian" },
  { token: "FD129", name: "Shahi Paneer", price: 350, tag: "Royal" },
  { token: "FD130", name: "Veg Jalfrezi", price: 270, tag: "Tangy" },
  { token: "FD131", name: "Butter Chicken", price: 450, tag: "Legendary" },
  { token: "FD132", name: "Chicken Curry", price: 380, tag: "Classic" },
  { token: "FD133", name: "Kadhai Chicken", price: 410, tag: "Spicy" },
  { token: "FD134", name: "Mutton Rogan Josh", price: 550, tag: "Signature" },
  { token: "FD135", name: "Chicken Tikka Masala", price: 430, tag: "Popular" },
  { token: "FD136", name: "Rara Mutton", price: 590, tag: "Heavy" },
  { token: "FD137", name: "Egg Curry", price: 240, tag: "Protein" },
  { token: "FD138", name: "Fish Curry", price: 480, tag: "Seafood" },
  { token: "FD139", name: "Handi Chicken", price: 420, tag: "Traditional" },
  { token: "FD140", name: "Mutton Korma", price: 560, tag: "Rich" },
  { token: "FD141", name: "Veg Biryani", price: 280, tag: "Aromatic" },
  { token: "FD142", name: "Chicken Dum Biryani", price: 380, tag: "Must Try" },
  { token: "FD143", name: "Mutton Biryani", price: 480, tag: "Rich" },
  { token: "FD144", name: "Egg Biryani", price: 260, tag: "Simple" },
  { token: "FD145", name: "Jeera Rice", price: 160, tag: "Light" },
  { token: "FD146", name: "Butter Naan", price: 60, tag: "Popular" },
  { token: "FD147", name: "Garlic Naan", price: 80, tag: "Flavorful" },
  { token: "FD148", name: "Tandoori Roti", price: 25, tag: "Healthy" },
  { token: "FD149", name: "Veg Hakka Noodles", price: 210, tag: "Kids Choice" },
  { token: "FD150", name: "Masala Chai", price: 40, tag: "Hot" },
];

const TOKEN_BY_MENU_NAME = new Map(
  RESTAURANT_MENU_CATALOG.map((item) => [item.name.toLowerCase(), item.token]),
);

const DUMMY_MENU_ITEMS: MenuItem[] = RESTAURANT_MENU_CATALOG.map((item) => ({
  id: item.token,
  token: item.token,
  name: item.name,
  price: item.price,
  tag: item.tag,
  isActive: true,
}));

function mapOrderFromBackend(order: BackendOrder, index: number): BillOrder {
  const items: OrderItem[] = (order.items ?? []).map((item, itemIndex) => ({
    id: String(item.id ?? `api-order-${index + 1}-item-${itemIndex + 1}`),
    name: item.name?.trim() || `Item ${itemIndex + 1}`,
    qty: Math.max(1, item.qty ?? item.quantity ?? 1),
    price: typeof item.price === "number" ? item.price : 0,
  }));

  const summary = summarizeOrderItems(items);
  const amount = typeof order.amount === "number" ? order.amount : typeof order.total === "number" ? order.total : summary.amount;

  return {
    id: String(order.id ?? order.orderId ?? `#B-${index + 1}`),
    customer: order.customer?.trim() || order.customerName?.trim() || "Guest",
    type: normalizeOrderType(order.type ?? order.orderType),
    amount,
    itemCount: typeof order.itemCount === "number" ? order.itemCount : summary.itemCount,
    elapsed: order.elapsed?.trim() || "Now",
    mobile: order.mobile?.trim() || order.phone?.trim() || "",
    section: normalizeSection(order.section),
    persons: Math.max(1, Number(order.persons ?? 1) || 1),
    tableId: order.tableId ?? null,
    deliveryAddress: order.deliveryAddress
      ? {
          flatNo: String(order.deliveryAddress.flatNo ?? ""),
          roomNo: String(order.deliveryAddress.roomNo ?? ""),
          landmark: String(order.deliveryAddress.landmark ?? ""),
          autoLocation: String(order.deliveryAddress.autoLocation ?? ""),
        }
      : null,
    payment: normalizePayment(order.payment ?? order.paymentType),
    splitPayment: normalizeSplitPayment(order.splitPayment),
    items,
    settled: Boolean(order.settled),
    paymentStatus: order.paymentStatus === "paid" ? "paid" : "pending",
    preparationStatus: order.preparationStatus === "prepared" ? "prepared" : "pending",
    unpaidAmountCleared: Boolean(order.unpaidAmountCleared),
  };
}

function mapTableFromBackend(table: BackendTable, index: number): TableNode {
  const resolvedId = String(table.id ?? table.tableId ?? `T${index + 1}`).toUpperCase();
  const resolvedLabel = (table.label?.trim() || resolvedId).toUpperCase();
  const resolvedStatus: TableStatus = table.status === "Occupied"
    ? "Occupied"
    : table.status === "Cleaning"
      ? "Cleaning"
      : table.status === "Reserved"
        ? "Reserved"
      : "Available";

  return {
    id: resolvedId,
    label: resolvedLabel,
    status: resolvedStatus,
  };
}

const DUMMY_TABLES: TableNode[] = [
  { id: "T1", label: "T1", status: "Available" },
  { id: "T2", label: "T2", status: "Occupied" },
  { id: "T3", label: "T3", status: "Cleaning" },
  { id: "T4", label: "T4", status: "Available" },
  { id: "T5", label: "T5", status: "Occupied" },
  { id: "T6", label: "T6", status: "Cleaning" },
  { id: "T7", label: "T7", status: "Available" },
  { id: "T8", label: "T8", status: "Occupied" },
];

async function fetchWithFallback<T>(paths: string[]): Promise<T | null> {
  for (const path of paths) {
    try {
      const response = await axios.get<T>(`${POS_API_BASE_URL}${path}`, { timeout: 6000 });
      return response.data;
    } catch {
      // Try next fallback endpoint.
    }
  }

  return null;
}

async function postWithFallback<TBody, TResponse>(paths: string[], body: TBody): Promise<TResponse | null> {
  for (const path of paths) {
    try {
      const response = await axios.post<TResponse>(`${POS_API_BASE_URL}${path}`, body, { timeout: 6000 });
      return response.data;
    } catch {
      // Try next fallback endpoint.
    }
  }

  return null;
}

async function patchWithFallback<TBody, TResponse>(paths: string[], body: TBody): Promise<TResponse | null> {
  for (const path of paths) {
    try {
      const response = await axios.patch<TResponse>(`${POS_API_BASE_URL}${path}`, body, { timeout: 6000 });
      return response.data;
    } catch {
      // Try next fallback endpoint.
    }
  }

  return null;
}

async function deleteWithFallback<TResponse>(paths: string[]): Promise<TResponse | null> {
  for (const path of paths) {
    try {
      const response = await axios.delete<TResponse>(`${POS_API_BASE_URL}${path}`, { timeout: 6000 });
      return response.data;
    } catch {
      // Try next fallback endpoint.
    }
  }

  return null;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const isThemeReadyRef = useRef(false);
  const [orders, setOrders] = useState<BillOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DUMMY_MENU_ITEMS);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>(DUMMY_MENU_ITEMS);
  const [menuAvailability, setMenuAvailability] = useState<Record<string, boolean>>(
    Object.fromEntries(DUMMY_MENU_ITEMS.map((item) => [item.id, true])),
  );
  const [tables, setTables] = useState<TableNode[]>(DUMMY_TABLES);
  const [menuSearch, setMenuSearch] = useState("");
  const [newOrderCustomer, setNewOrderCustomer] = useState("");
  const [newOrderMobile, setNewOrderMobile] = useState("");
  const [newOrderType, setNewOrderType] = useState<OrderType>("Dine-In");
  const [newOrderFlatNo, setNewOrderFlatNo] = useState("");
  const [newOrderRoomNo, setNewOrderRoomNo] = useState("");
  const [newOrderLandmark, setNewOrderLandmark] = useState("");
  const [newOrderAutoLocation, setNewOrderAutoLocation] = useState("");
  const [newOrderTableId, setNewOrderTableId] = useState<string | null>(null);
  const [isSavingNewOrder, setIsSavingNewOrder] = useState(false);
  const [activeBillAction, setActiveBillAction] = useState<null | "savePrint" | "saveEbill" | "kot" | "kotPrint" | "settle">(null);
  const [isSelectingTableEntry, setIsSelectingTableEntry] = useState(false);
  const [newTableLabel, setNewTableLabel] = useState("");
  const [newTableStatus, setNewTableStatus] = useState<TableStatus>("Available");
  const [candidateTableId, setCandidateTableId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [showTableEntry, setShowTableEntry] = useState(true);
  const [showTableModal, setShowTableModal] = useState(false);
  const [quickUpdateTableId, setQuickUpdateTableId] = useState<string | null>(null);
  const [quickUpdateStatus, setQuickUpdateStatus] = useState<TableStatus>("Available");
  const [quickViewData, setQuickViewData] = useState<{ tableId: string; status: TableStatus; order: BillOrder | null } | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const openOrders = useMemo(() => orders.filter((order) => !order.settled), [orders]);
  const filteredMenuItems = useMemo(() => {
    const query = menuSearch.trim().toLowerCase();
    const sourceItems = allMenuItems.length > 0 ? allMenuItems : menuItems;

    return sourceItems.filter((item) => {
      const isActive = menuAvailability[item.id] ?? item.isActive ?? true;
      if (!isActive) {
        return false;
      }
      if (!query) {
        return true;
      }
      const searchable = `${item.name} ${item.tag} ${item.token}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [allMenuItems, menuItems, menuSearch, menuAvailability]);

  const menuSettingsItems = useMemo(() => {
    const query = menuSearch.trim().toLowerCase();
    const sourceItems = allMenuItems.length > 0 ? allMenuItems : menuItems;

    return sourceItems.filter((item) => {
      if (!query) {
        return true;
      }
      const searchable = `${item.name} ${item.tag} ${item.token}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [allMenuItems, menuItems, menuSearch]);

  const tableStats = useMemo(() => {
    const occupied = tables.filter((table) => table.status === "Occupied").length;
    const cleaning = tables.filter((table) => table.status === "Cleaning").length;
    const reserved = tables.filter((table) => table.status === "Reserved").length;
    return {
      occupied,
      cleaning,
      reserved,
      available: tables.length - occupied - cleaning - reserved,
    };
  }, [tables]);

  useEffect(() => {
    if (!banner) {
      return;
    }

    const timeout = window.setTimeout(() => setBanner(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [banner]);

  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "tables") {
      setShowTableEntry(true);
      setCandidateTableId(null);
      return;
    }

    const tableFromQuery = searchParams.get("table");
    if (!tableFromQuery) {
      return;
    }

    const normalized = tableFromQuery.toUpperCase();
    setShowTableEntry(false);
    setNewOrderTableId(normalized);
    setCandidateTableId(normalized);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadBackendData() {
      const [ordersResponse, popularMenuResponse, fullMenuResponse, tablesResponse] = await Promise.all([
        fetchWithFallback<BackendOrder[] | { data: BackendOrder[] }>(["/api/pos/orders/active", "/api/orders/active", "/orders/active"]),
        fetchWithFallback<BackendMenuItem[] | { data: BackendMenuItem[] }>(["/api/pos/menu/popular?limit=50", "/api/menu/popular?limit=50", "/menu/popular?limit=50"]),
        fetchWithFallback<BackendMenuItem[] | { data: BackendMenuItem[] }>(["/api/pos/menu/all", "/api/menu/all", "/menu/all", "/api/pos/menu", "/api/menu", "/menu"]),
        fetchWithFallback<BackendTable[] | { data: BackendTable[] }>(["/api/pos/tables", "/api/tables", "/tables"]),
      ]);

      if (!isMounted) {
        return;
      }

      const parsedOrders = Array.isArray(ordersResponse)
        ? ordersResponse
        : Array.isArray(ordersResponse?.data)
          ? ordersResponse.data
          : [];
      const parsedPopularMenu = Array.isArray(popularMenuResponse)
        ? popularMenuResponse
        : Array.isArray(popularMenuResponse?.data)
          ? popularMenuResponse.data
          : [];
      const parsedFullMenu = Array.isArray(fullMenuResponse)
        ? fullMenuResponse
        : Array.isArray(fullMenuResponse?.data)
          ? fullMenuResponse.data
          : [];
      const parsedTables = Array.isArray(tablesResponse)
        ? tablesResponse
        : Array.isArray(tablesResponse?.data)
          ? tablesResponse.data
          : [];

      if (parsedOrders.length > 0) {
        const nextOrders = parsedOrders.map(mapOrderFromBackend);
        setOrders(nextOrders);
        setSelectedOrderId(nextOrders[0]?.id ?? "");
      }

      if (parsedPopularMenu.length > 0) {
        setMenuItems(parsedPopularMenu.map(mapMenuFromBackend).slice(0, 50));
      } else {
        setMenuItems(DUMMY_MENU_ITEMS);
      }

      if (parsedFullMenu.length > 0) {
        const mapped = parsedFullMenu.map(mapMenuFromBackend);
        setAllMenuItems(mapped);
        setMenuAvailability(
          Object.fromEntries(mapped.map((item) => [item.id, item.isActive !== false])),
        );
      } else {
        setAllMenuItems(DUMMY_MENU_ITEMS);
        setMenuAvailability(
          Object.fromEntries(DUMMY_MENU_ITEMS.map((item) => [item.id, true])),
        );
      }

      if (parsedTables.length > 0) {
        setTables(parsedTables.map(mapTableFromBackend));
      } else {
        setTables(DUMMY_TABLES);
      }
    }

    void loadBackendData();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentOrder = useMemo(() => {
    const selected = orders.find((order) => order.id === selectedOrderId && !order.settled);
    if (selected) {
      return selected;
    }

    return openOrders[0] ?? null;
  }, [orders, selectedOrderId, openOrders]);

  const payment = currentOrder?.payment ?? "None";
  const mobile = currentOrder?.mobile ?? "";
  const customerName = currentOrder?.customer ?? "";
  const currentOrderType = currentOrder?.type ?? "Dine-In";
  const currentOrderSection = currentOrder?.section ?? "AC";
  const currentOrderPersons = currentOrder?.persons ?? 1;
  const currentOrderTableId = currentOrder?.tableId ?? null;
  const items = useMemo(() => currentOrder?.items ?? [], [currentOrder]);
  const selectedNewOrderTable = newOrderTableId
    ? tables.find((table) => table.id === newOrderTableId) ?? null
    : null;

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.qty * item.price, 0), [items]);
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);
  const grandTotal = subtotal + tax;

  function summarize(itemsToSum: OrderItem[]) {
    const lineTotal = itemsToSum.reduce((acc, item) => acc + item.qty * item.price, 0);
    const computedTax = Math.round(lineTotal * 0.05);
    return {
      amount: lineTotal + computedTax,
      itemCount: itemsToSum.reduce((acc, item) => acc + item.qty, 0),
    };
  }

  function updateCurrentOrder(
    update:
      | Partial<BillOrder>
      | ((order: BillOrder) => Partial<BillOrder>),
  ) {
    if (!currentOrder) {
      return;
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== currentOrder.id) {
          return order;
        }

        const patch = typeof update === "function" ? update(order) : update;
        const nextItems = patch.items ?? order.items;
        const nextSummary = summarize(nextItems);

        return {
          ...order,
          ...patch,
          items: nextItems,
          amount: nextSummary.amount,
          itemCount: nextSummary.itemCount,
        };
      }),
    );
  }

  async function persistPaymentDetails(orderId: string, nextPayment: PaymentType, nextSplitPayment: SplitPayment | null) {
    await patchWithFallback(
      [`/api/pos/orders/${encodeURIComponent(orderId)}`, `/api/orders/${encodeURIComponent(orderId)}`, `/orders/${encodeURIComponent(orderId)}`],
      {
        payment: nextPayment,
        splitPayment: nextPayment === "Split" ? nextSplitPayment : null,
      },
    );
  }

  function handleNewOrderTypeChange(value: OrderType) {
    setNewOrderType(value);
    if (value !== "Dine-In") {
      setNewOrderTableId(null);
      setCandidateTableId(null);
    }
    if (value !== "Delivery") {
      setNewOrderFlatNo("");
      setNewOrderRoomNo("");
      setNewOrderLandmark("");
      setNewOrderAutoLocation("");
    }
  }

  function detectNewOrderLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setBanner("Location is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        setNewOrderAutoLocation(`${latitude}, ${longitude}`);
        setBanner("Auto location detected.");
      },
      () => {
        setBanner("Unable to detect location.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function toggleTableStatus(tableId: string) {
    const target = tables.find((table) => table.id === tableId);
    if (!target) {
      return;
    }

    const nextStatus: TableStatus = target.status === "Available"
      ? "Occupied"
      : target.status === "Occupied"
        ? "Cleaning"
        : target.status === "Cleaning"
          ? "Reserved"
          : "Available";

    await updateTableStatus(tableId, nextStatus);
  }

  async function updateTableStatus(tableId: string, nextStatus: TableStatus) {
    const target = tables.find((table) => table.id === tableId);
    if (!target) {
      return;
    }

    const response = await patchWithFallback<{ status: TableStatus }, { table?: BackendTable }>(
      [`/api/pos/tables/${tableId}/status`, `/api/tables/${tableId}/status`, `/tables/${tableId}/status`],
      { status: nextStatus },
    );

    const persistedTable = response?.table ? mapTableFromBackend(response.table, 0) : null;

    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? persistedTable ?? { ...table, status: nextStatus }
          : table,
      ),
    );

    if (nextStatus !== "Occupied") {
      setOrders((prev) =>
        prev.map((order) =>
          !order.settled && order.tableId === tableId
            ? { ...order, tableId: null }
            : order,
        ),
      );
    }

    setBanner(`${tableId} marked ${nextStatus.toLowerCase()}.`);
  }

  async function addNewTable() {
    const trimmedLabel = newTableLabel.trim();
    if (!trimmedLabel) {
      setBanner("Enter a table number or name first.");
      return;
    }

    const normalizedLabel = trimmedLabel.toUpperCase().startsWith("T")
      ? trimmedLabel.toUpperCase()
      : `T${trimmedLabel.toUpperCase()}`;

    const duplicate = tables.some((table) => table.label.toUpperCase() === normalizedLabel);
    if (duplicate) {
      setBanner(`${normalizedLabel} already exists.`);
      return;
    }

    const response = await postWithFallback<{ label: string; status: TableStatus }, { table?: BackendTable }>(
      ["/api/pos/tables", "/api/tables", "/tables"],
      { label: normalizedLabel, status: newTableStatus },
    );

    const persistedTable = response?.table ? mapTableFromBackend(response.table, tables.length) : null;

    setTables((prev) => [
      ...prev,
      persistedTable ?? {
        id: normalizedLabel,
        label: normalizedLabel,
        status: newTableStatus,
      },
    ]);

    setNewTableLabel("");
    setNewTableStatus("Available");
    setBanner(`Added ${normalizedLabel} as ${newTableStatus.toLowerCase()}.`);
  }

  async function deleteTable(tableId: string) {
    const target = tables.find((table) => table.id === tableId);
    if (!target) {
      return;
    }

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`Delete ${target.label}? This will remove table assignment from active orders.`);
      if (!confirmed) {
        return;
      }
    }

    const response = await deleteWithFallback<{ message?: string }>(
      [`/api/pos/tables/${tableId}`, `/api/tables/${tableId}`, `/tables/${tableId}`],
    );

    if (!response) {
      setBanner(`Could not delete ${tableId}.`);
      return;
    }

    setTables((prev) => prev.filter((table) => table.id !== tableId));
    setOrders((prev) =>
      prev.map((order) =>
        !order.settled && order.tableId === tableId
          ? { ...order, tableId: null }
          : order,
      ),
    );

    if (candidateTableId === tableId) {
      setCandidateTableId(null);
    }

    setBanner(response.message ?? `Deleted ${tableId}.`);
  }

  function selectTable(tableId: string) {
    const selected = tables.find((table) => table.id === tableId);
    if (!selected) {
      return;
    }

    const sameTable = newOrderTableId === tableId;
    if (selected.status !== "Available" && !sameTable) {
      setBanner(`Table ${tableId} is currently ${selected.status.toLowerCase()}.`);
      return;
    }

    setCandidateTableId(tableId);
    setBanner(`Selected table ${tableId}. Confirm to assign.`);
  }

  async function confirmSelectedTable() {
    if (!candidateTableId) {
      setBanner("Select a table first.");
      return;
    }

    const tableId = candidateTableId;
    const selected = tables.find((table) => table.id === tableId);
    if (!selected) {
      return;
    }

    const sameTable = newOrderTableId === tableId;
    if (selected.status !== "Available" && !sameTable) {
      setBanner(`Table ${tableId} is currently ${selected.status.toLowerCase()}.`);
      return;
    }

    setNewOrderTableId(tableId);
    setShowTableModal(false);
    setBanner(`Selected table ${tableId} for new order.`);
  }

  useEffect(() => {
    setCandidateTableId(newOrderTableId ?? null);
  }, [newOrderTableId]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pos-theme");
    window.setTimeout(() => {
      isThemeReadyRef.current = true;
      if (savedTheme === "dark") {
        setTheme("dark");
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!isThemeReadyRef.current) {
      return;
    }
    window.localStorage.setItem("pos-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  const palette: Palette = {
    shell: isDark ? "bg-[#05070d] text-slate-100" : "bg-[#f5eee8] text-slate-900",
    backdrop: isDark
      ? "bg-[radial-gradient(circle_at_14%_18%,rgba(232,92,78,0.18),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(249,168,37,0.12),transparent_34%),radial-gradient(circle_at_54%_88%,rgba(56,189,248,0.12),transparent_36%),linear-gradient(160deg,#05070d,#0b1020_48%,#05070d)]"
      : "bg-[radial-gradient(circle_at_14%_18%,rgba(240,106,90,0.16),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(245,158,11,0.14),transparent_34%),radial-gradient(circle_at_54%_88%,rgba(34,197,94,0.10),transparent_36%),linear-gradient(160deg,#fffaf7,#f7efe8_48%,#f2e7df)]",
    sidebar: isDark ? "border-white/8 bg-[#08101a]/90" : "border-white/8 bg-[#fff7f2]/95",
    sidebarBrand: isDark ? "text-[#ff9f8f]" : "text-[#cc4b3e]",
    sidebarActive: isDark
      ? "border-[#f06a5a]/35 bg-[#f06a5a]/14 text-[#ffd8d3]"
      : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]",
    sidebarItem: isDark
      ? "border-white/8 bg-white/[0.045] text-slate-300 hover:bg-white/10"
      : "border-black/5 bg-white/75 text-slate-700 hover:bg-white",
    header: isDark ? "border-white/8 bg-[#0b1220]/72" : "border-white/8 bg-[#fff7f2]/88",
    headerPill: isDark ? "border-white/8 bg-white/[0.055] text-slate-300" : "border-white/8 bg-[#ffffff] text-slate-700",
    orderPill: isDark ? "bg-[#f06a5a]/18" : "bg-[#cc4b3e]/12",
    orderText: isDark ? "text-[#ffd8d3]" : "text-[#7f1d16]",
    sectionButton: isDark
      ? "border-white/8 bg-white/[0.06] text-slate-100 backdrop-blur-md"
      : "border-white/8 bg-[#ffffff] text-slate-800 backdrop-blur-md",
    sectionMenu: isDark ? "border-white/8 bg-[#101726]/96" : "border-white/8 bg-[#ffffff]/96",
    sectionActive: isDark ? "bg-[#f06a5a]/15 text-[#ffd8d3]" : "bg-[#cc4b3e]/12 text-[#7f1d16]",
    dropdownBase: isDark
      ? "w-full appearance-none rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 pr-9 text-sm text-slate-100 outline-none transition focus:border-[#f06a5a]/45"
      : "w-full appearance-none rounded-xl border border-black/8 bg-white px-3 py-2 pr-9 text-sm text-slate-800 outline-none transition focus:border-[#cc4b3e]/35",
    dropdownMenu: isDark
      ? "absolute z-[160] mt-1 w-full rounded-xl border border-white/10 bg-[#101726]/96 p-1 text-sm backdrop-blur-xl shadow-[0_18px_40px_rgba(2,6,23,0.35)]"
      : "absolute z-[160] mt-1 w-full rounded-xl border border-black/8 bg-white/96 p-1 text-sm backdrop-blur-xl shadow-[0_18px_40px_rgba(2,6,23,0.18)]",
    dropdownOptionActive: isDark ? "bg-[#f06a5a]/15 text-[#ffd8d3]" : "bg-[#cc4b3e]/12 text-[#7f1d16]",
    selectTable: isDark ? "border-[#6be7cf]/25 bg-[#6be7cf]/12 text-[#d8fff7]" : "border-[#cc4b3e]/20 bg-[#cc4b3e]/10 text-[#7f1d16]",
    panel: isDark ? "border-white/8 bg-white/[0.05]" : "border-white/8 bg-[#ffffff]/86",
    panelSoft: isDark ? "border-white/8 bg-white/[0.055]" : "border-white/8 bg-[#ffffff]/92",
    textMuted: isDark ? "text-slate-300" : "text-slate-600",
    textStrong: isDark ? "text-white" : "text-slate-900",
    highlight: isDark ? "text-[#ffb4a8]" : "text-[#cc4b3e]",
    gridCard: isDark ? "border-white/8 bg-white/[0.04]" : "border-white/8 bg-[#ffffff]/92",
    totals: isDark ? "border-white/8 bg-white/[0.06]" : "border-white/8 bg-[#ffffff]",
    paymentPanel: isDark ? "border-white/8 bg-[#0a101c]/78" : "border-white/8 bg-[#ffffff]/94",
    modal: isDark ? "border-white/15 bg-[#0c1323]/92" : "border-white/8 bg-[#ffffff]/96",
    modalOverlay: isDark ? "bg-black/60" : "bg-black/35",
    modalGrid: isDark
      ? "border-white/8 bg-[linear-gradient(145deg,rgba(8,12,22,0.96),rgba(12,20,35,0.9))]"
      : "border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(248,241,236,0.96))]",
    tableGrid: isDark
      ? "border-white/8 bg-white/[0.05]"
      : "border-white/8 bg-[#ffffff]/86",
    floatingBadge: isDark
      ? "border-[#6be7cf]/25 bg-[#6be7cf]/12 text-[#d8fff7]"
      : "border-[#2f9e88]/20 bg-[#2f9e88]/10 text-[#14564a]",
  };

  function addItem(menuItem: MenuItem) {
    if (!currentOrder) {
      return;
    }

    const isActive = menuAvailability[menuItem.id] ?? menuItem.isActive ?? true;
    if (!isActive) {
      setBanner(`${menuItem.name} is marked unavailable.`);
      return;
    }

    const exists = currentOrder.items.find((entry) => entry.id === menuItem.id);
    const nextItems = exists
      ? currentOrder.items.map((entry) =>
          entry.id === menuItem.id ? { ...entry, qty: entry.qty + 1 } : entry,
        )
      : [...currentOrder.items, { id: menuItem.id, name: menuItem.name, qty: 1, price: menuItem.price }];
    const nextSummary = summarize(nextItems);
    const nextOrder: BillOrder = {
      ...currentOrder,
      items: nextItems,
      amount: nextSummary.amount,
      itemCount: nextSummary.itemCount,
    };

    setOrders((prev) =>
      prev.map((order) => (order.id === currentOrder.id ? nextOrder : order)),
    );

    void persistOrderToBackend(nextOrder);
  }

  async function toggleMenuAvailability(menuItemId: string, nextAvailability: boolean) {
    setMenuAvailability((prev) => ({ ...prev, [menuItemId]: nextAvailability }));

    setAllMenuItems((prev) =>
      prev.map((item) =>
        item.id === menuItemId
          ? { ...item, isActive: nextAvailability }
          : item,
      ),
    );

    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === menuItemId
          ? { ...item, isActive: nextAvailability }
          : item,
      ),
    );

    const looksLikeMongoId = /^[a-f\d]{24}$/i.test(menuItemId);
    if (!looksLikeMongoId) {
      return;
    }

    const response = await patchWithFallback<{ isActive: boolean }, BackendMenuItem>(
      [`/api/pos/menu/${menuItemId}/availability`, `/api/menu/${menuItemId}/availability`, `/menu/${menuItemId}/availability`],
      { isActive: nextAvailability },
    );

    if (!response) {
      setBanner("Could not update menu availability on server.");
    }
  }

  async function persistOrderToBackend(orderToPersist?: BillOrder) {
    const targetOrder = orderToPersist ?? currentOrder;
    if (!targetOrder) {
      return false;
    }

    try {
      const payload = {
        customer: targetOrder.customer,
        mobile: targetOrder.mobile,
        type: targetOrder.type,
        section: targetOrder.section,
        persons: targetOrder.persons,
        tableId: targetOrder.tableId,
        deliveryAddress: targetOrder.deliveryAddress,
        payment: targetOrder.payment,
        splitPayment: targetOrder.splitPayment,
        paymentStatus: targetOrder.paymentStatus,
        preparationStatus: targetOrder.preparationStatus,
        unpaidAmountCleared: targetOrder.unpaidAmountCleared,
        settled: targetOrder.settled,
        items: targetOrder.items,
      };

      const response = await patchWithFallback(
         [`/api/pos/orders/${encodeURIComponent(targetOrder.id)}`, `/api/orders/${encodeURIComponent(targetOrder.id)}`, `/orders/${encodeURIComponent(targetOrder.id)}`],
        payload,
      );

      return Boolean(response);
    } catch (error) {
      console.error("Failed to persist order to backend:", error);
      return false;
    }
  }

  function moveOrderToSaved(nextOrder: BillOrder) {
    setOrders((prev) => prev.map((order) => (order.id === nextOrder.id ? nextOrder : order)));
    if (nextOrder.tableId) {
      setTables((prev) =>
        prev.map((table) =>
          table.id === nextOrder.tableId ? { ...table, status: "Available" } : table,
        ),
      );
    }
    setSelectedOrderId((prev) => (prev === nextOrder.id ? "" : prev));
    setCandidateTableId(null);
  }

  function updateQty(id: string, delta: number) {
    if (!currentOrder) {
      return;
    }

    const nextItems = currentOrder.items
      .map((entry) =>
        entry.id === id ? { ...entry, qty: Math.max(0, entry.qty + delta) } : entry,
      )
      .filter((entry) => entry.qty > 0);
    const nextSummary = summarize(nextItems);
    const nextOrder: BillOrder = {
      ...currentOrder,
      items: nextItems,
      amount: nextSummary.amount,
      itemCount: nextSummary.itemCount,
    };

    setOrders((prev) =>
      prev.map((order) => (order.id === currentOrder.id ? nextOrder : order)),
    );

    void persistOrderToBackend(nextOrder);
  }

  async function handleSettleAndSave() {
    if (!currentOrder) {
      return;
    }

    if (activeBillAction) {
      return;
    }

    setActiveBillAction("settle");

    const effectivePayment: PaymentType = payment === "None" ? "Cash" : payment;
    if (payment === "None") {
      updateCurrentOrder({ payment: "Cash", splitPayment: null });
    }

    if (effectivePayment === "Split") {
      const splitCash = currentOrder.splitPayment?.cash ?? 0;
      const splitUpi = currentOrder.splitPayment?.upi ?? 0;
      if (splitCash <= 0 || splitUpi <= 0 || Math.abs(splitCash + splitUpi - currentOrder.amount) > 0.01) {
        setBanner("For split payment, enter valid cash and UPI amounts equal to bill total.");
        setActiveBillAction(null);
        return;
      }
    }

    const tableId = currentOrder.tableId;
    const settledOrder: BillOrder = {
      ...currentOrder,
      settled: true,
      payment: effectivePayment,
      splitPayment: effectivePayment === "Split" ? currentOrder.splitPayment : null,
      elapsed: "Settled",
    };

    // Instant local settle so item moves out of active list immediately.
    setOrders((prev) => prev.map((order) => (order.id === currentOrder.id ? settledOrder : order)));
    setSelectedOrderId((prev) => (prev === currentOrder.id ? "" : prev));

    if (tableId) {
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, status: "Available" } : table,
        ),
      );
    }

    setCandidateTableId(null);
    setBanner(`${currentOrder.id} settled and saved.`);
    setActiveBillAction(null);

    // Sync backend in background; do not block UI.
    void (async () => {
      const persisted = await persistOrderToBackend(settledOrder);
      if (!persisted) {
        setBanner(`${currentOrder.id} settled locally. Backend save pending.`);
        return;
      }

      const settledResponse = await patchWithFallback<{ payment: PaymentType; splitPayment: SplitPayment | null }, unknown>(
        [`/api/pos/orders/${encodeURIComponent(currentOrder.id)}/settle`, `/api/orders/${encodeURIComponent(currentOrder.id)}/settle`, `/orders/${encodeURIComponent(currentOrder.id)}/settle`],
        {
          payment: effectivePayment,
          splitPayment: settledOrder.splitPayment,
        },
      );

      if (!settledResponse) {
        setBanner(`${currentOrder.id} settled locally. Settlement sync pending.`);
      }

      if (tableId) {
        const releaseResponse = await patchWithFallback<{ orderId: string }, unknown>(
          [`/api/pos/tables/${tableId}/release`, `/api/tables/${tableId}/release`, `/tables/${tableId}/release`],
          { orderId: currentOrder.id },
        );

        if (!releaseResponse) {
          setBanner(`${currentOrder.id} settled, but table release sync is pending.`);
        }
      }
    })();
  }

  async function handleSaveAndPrint() {
    if (!currentOrder) {
      return;
    }

    if (activeBillAction) {
      return;
    }

    setActiveBillAction("savePrint");

    try {
      const savedOrder: BillOrder = {
        ...currentOrder,
        settled: true,
        paymentStatus: "paid",
        elapsed: "Settled",
      };
      moveOrderToSaved(savedOrder);

      const printWindow = typeof window !== "undefined"
        ? window.open("", "_blank", "width=840,height=700")
        : null;

      const persisted = await persistOrderToBackend(savedOrder);
      if (!persisted) {
        if (printWindow) {
          printWindow.close();
        }
        setBanner(`${currentOrder.id} saved locally. Backend sync pending.`);
        return;
      }

      setBanner(`${currentOrder.id} saved.`);
      if (printWindow) {
        const now = new Date();
        const rowsHtml = currentOrder.items
          .map((item, index) => {
            const lineTotal = item.qty * item.price;
            return `<tr><td>${index + 1}</td><td>${item.name}</td><td>${item.qty}</td><td>${item.price}</td><td>${lineTotal}</td></tr>`;
          })
          .join("");

        printWindow.document.write(`<!doctype html><html><head><title>Bill ${currentOrder.id}</title><style>
        body{font-family:Arial,sans-serif;padding:20px;color:#111}
        h1{margin:0 0 6px 0;font-size:22px}
        .meta{margin-bottom:12px;font-size:13px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{border:1px solid #ddd;padding:8px;font-size:13px;text-align:left}
        th{background:#f4f4f4}
        .totals{margin-top:14px;display:flex;justify-content:flex-end}
        .totals div{width:260px}
        .totals p{display:flex;justify-content:space-between;margin:6px 0}
        .strong{font-weight:bold;font-size:15px}
      </style></head><body>
        <h1>Restaurant POS Bill</h1>
        <div class="meta">
          <div>Bill No: ${currentOrder.id}</div>
          <div>Date: ${now.toLocaleString()}</div>
          <div>Customer: ${currentOrder.customer || "Guest"}</div>
          <div>Mobile: ${currentOrder.mobile || "-"}</div>
          <div>Type: ${currentOrder.type} | Section: ${currentOrder.section} | Table: ${currentOrder.tableId || "-"} | Persons: ${currentOrder.persons ?? 1}</div>
        </div>
        <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rowsHtml || "<tr><td colspan='5'>No items</td></tr>"}</tbody></table>
        <div class="totals"><div>
          <p><span>Subtotal</span><span>${subtotal}</span></p>
          <p><span>Tax</span><span>${tax}</span></p>
          <p class="strong"><span>Grand Total</span><span>${grandTotal}</span></p>
        </div></div>
      </body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    } finally {
      setActiveBillAction(null);
    }
  }

  async function handleSaveOrder(showSuccessBanner = true) {
    if (!currentOrder) {
      return false;
    }

    const persisted = await persistOrderToBackend(currentOrder);
    if (!persisted) {
      setBanner(`Could not save ${currentOrder.id}.`);
      return false;
    }

    if (showSuccessBanner) {
      setBanner(`${currentOrder.id} saved.`);
    }
    return true;
  }

  async function handleSaveAndEbill() {
    if (!currentOrder) {
      return;
    }

    if (activeBillAction) {
      return;
    }

    setActiveBillAction("saveEbill");
    try {
      const savedOrder: BillOrder = {
        ...currentOrder,
        settled: true,
        paymentStatus: "paid",
        elapsed: "Settled",
      };
      moveOrderToSaved(savedOrder);

      const persisted = await persistOrderToBackend(savedOrder);
      if (!persisted) {
        setBanner(`${currentOrder.id} saved locally. Backend sync pending.`);
      }

      const mobileNumber = (savedOrder.mobile ?? "").replace(/\D/g, "");
      if (!mobileNumber) {
        setBanner(`${savedOrder.id} saved. No mobile number provided for EBill.`);
        return;
      }

      const summary = `${savedOrder.id} | ${savedOrder.customer || "Guest"} | Total ${money(savedOrder.amount)} | Thank you for dining with us.`;
      if (typeof window !== "undefined") {
        window.open(`sms:${mobileNumber}?body=${encodeURIComponent(summary)}`, "_blank");
      }
      setBanner(`${savedOrder.id} saved and EBill sent to ${mobileNumber}.`);
    } finally {
      setActiveBillAction(null);
    }
  }

  function updateAndPersistCurrentOrder(patch: Partial<BillOrder>) {
    if (!currentOrder) {
      return;
    }

    const nextItems = patch.items ?? currentOrder.items;
    const nextSummary = summarize(nextItems);
    const nextOrder: BillOrder = {
      ...currentOrder,
      ...patch,
      items: nextItems,
      amount: nextSummary.amount,
      itemCount: nextSummary.itemCount,
    };

    setOrders((prev) => prev.map((order) => (order.id === currentOrder.id ? nextOrder : order)));
    void persistOrderToBackend(nextOrder);
  }

  function handleCurrentOrderTypeChange(value: OrderType) {
    if (!currentOrder) {
      return;
    }

    updateAndPersistCurrentOrder({
      type: value,
      tableId: value === "Dine-In" ? currentOrder.tableId : null,
      deliveryAddress: value === "Delivery" ? currentOrder.deliveryAddress : null,
    });
  }

  function handleCurrentOrderSectionChange(value: SectionType) {
    updateAndPersistCurrentOrder({ section: value });
  }

  function handleCurrentOrderPersonsChange(value: number) {
    updateAndPersistCurrentOrder({ persons: Math.max(1, value || 1) });
  }

  async function handleCreateKOT() {
    if (!currentOrder) {
      setBanner("Select an order first.");
      return;
    }

    if (activeBillAction) {
      return;
    }

    setActiveBillAction("kot");
    try {
      const kotOrder: BillOrder = {
        ...currentOrder,
        settled: false,
        preparationStatus: "prepared",
        paymentStatus: "pending",
        elapsed: "Now",
      };
      setOrders((prev) => prev.map((order) => (order.id === kotOrder.id ? kotOrder : order)));

      const saved = await persistOrderToBackend(kotOrder);
      if (!saved) {
        setBanner(`${currentOrder.id} moved to KOT (unpaid) locally. Backend sync pending.`);
        return;
      }
      setBanner(`KOT generated for ${currentOrder.id} (unpaid).`);
    } finally {
      setActiveBillAction(null);
    }
  }

  async function handleCreateKOTAndPrint() {
    if (!currentOrder) {
      setBanner("Select an order first.");
      return;
    }

    if (activeBillAction) {
      return;
    }

    setActiveBillAction("kotPrint");
    try {
      const kotOrder: BillOrder = {
        ...currentOrder,
        settled: false,
        preparationStatus: "prepared",
        paymentStatus: "pending",
        elapsed: "Now",
      };
      setOrders((prev) => prev.map((order) => (order.id === kotOrder.id ? kotOrder : order)));

      const printWindow = typeof window !== "undefined"
        ? window.open("", "_blank", "width=560,height=720")
        : null;

      const saved = await persistOrderToBackend(kotOrder);
      if (!saved) {
        if (printWindow) {
          printWindow.close();
        }
        setBanner(`${currentOrder.id} moved to KOT (unpaid) locally. Backend sync pending.`);
        return;
      }

      setBanner(`KOT print started for ${currentOrder.id} (unpaid).`);
      if (printWindow) {
        const now = new Date();
        const rowsHtml = currentOrder.items
          .map((item, index) => `<tr><td>${index + 1}</td><td>${item.name}</td><td>${item.qty}</td></tr>`)
          .join("");

        printWindow.document.write(`<!doctype html><html><head><title>KOT ${currentOrder.id}</title><style>
          body{font-family:Arial,sans-serif;padding:18px;color:#111}
          h1{margin:0 0 8px 0;font-size:20px}
          .meta{margin-bottom:10px;font-size:13px;line-height:1.45}
          table{width:100%;border-collapse:collapse;margin-top:10px}
          th,td{border:1px solid #ddd;padding:8px;font-size:13px;text-align:left}
          th{background:#f4f4f4}
        </style></head><body>
          <h1>Kitchen Order Ticket</h1>
          <div class="meta">
            <div>Bill No: ${currentOrder.id}</div>
            <div>Date: ${now.toLocaleString()}</div>
            <div>Table: ${currentOrder.tableId || "-"}</div>
            <div>Section: ${currentOrder.section}</div>
            <div>Persons: ${currentOrder.persons ?? 1}</div>
          </div>
          <table><thead><tr><th>#</th><th>Item</th><th>Qty</th></tr></thead><tbody>${rowsHtml || "<tr><td colspan='3'>No items</td></tr>"}</tbody></table>
        </body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    } finally {
      setActiveBillAction(null);
    }
  }

  function extractCreatedOrder(payload: unknown): BackendOrder | null {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const candidate = payload as { data?: unknown; order?: unknown };

    if (candidate.data && typeof candidate.data === "object") {
      const nestedData = candidate.data as { order?: unknown };
      if (nestedData.order && typeof nestedData.order === "object") {
        return nestedData.order as BackendOrder;
      }
      return candidate.data as BackendOrder;
    }

    if (candidate.order && typeof candidate.order === "object") {
      return candidate.order as BackendOrder;
    }

    return payload as BackendOrder;
  }

  async function handleCreateOrder() {
    if (isSavingNewOrder) {
      return;
    }

    const customer = newOrderCustomer.trim() || "Guest";
    const mobileValue = newOrderMobile.trim();
    setIsSavingNewOrder(true);

    try {
      const payload = {
        customer,
        mobile: mobileValue,
        type: newOrderType,
        section: "AC",
        persons: 1,
        tableId: newOrderType === "Dine-In" ? newOrderTableId : null,
        deliveryAddress: newOrderType === "Delivery"
          ? {
              flatNo: newOrderFlatNo.trim(),
              roomNo: newOrderRoomNo.trim(),
              landmark: newOrderLandmark.trim(),
              autoLocation: newOrderAutoLocation.trim(),
            }
          : null,
        payment: "None",
        splitPayment: null,
        items: [] as BackendOrderItem[],
        settled: false,
      };

      const createdResponse = await postWithFallback<typeof payload, unknown>(
        ["/api/pos/orders", "/api/orders", "/orders"],
        payload,
      );

      let newOrder: BillOrder;
      const createdOrder = extractCreatedOrder(createdResponse);

      if (createdOrder) {
        newOrder = mapOrderFromBackend(createdOrder, orders.length + 1);
        if (!newOrder.elapsed) {
          newOrder.elapsed = "Now";
        }

        if (newOrderType === "Dine-In" && newOrderTableId) {
          void patchWithFallback<{ orderId: string }, { table?: BackendTable }>(
            [`/api/pos/tables/${newOrderTableId}/assign`, `/api/tables/${newOrderTableId}/assign`, `/tables/${newOrderTableId}/assign`],
            { orderId: newOrder.id },
          );
          setTables((prev) =>
            prev.map((table) =>
              table.id === newOrderTableId ? { ...table, status: "Occupied" } : table,
            ),
          );
        }

        setBanner(`Saved ${newOrder.id} to backend.`);
      } else {
        const fallbackId = `#N-${String(Date.now()).slice(-6)}`;
        newOrder = {
          id: fallbackId,
          customer,
          type: newOrderType,
          amount: 0,
          itemCount: 0,
          elapsed: "Now",
          mobile: mobileValue,
          section: "AC",
          persons: 1,
          tableId: newOrderType === "Dine-In" ? newOrderTableId : null,
          deliveryAddress: newOrderType === "Delivery"
            ? {
                flatNo: newOrderFlatNo.trim(),
                roomNo: newOrderRoomNo.trim(),
                landmark: newOrderLandmark.trim(),
                autoLocation: newOrderAutoLocation.trim(),
              }
            : null,
          payment: "None",
          splitPayment: null,
          items: [],
          settled: false,
          paymentStatus: "pending",
          preparationStatus: "pending",
          unpaidAmountCleared: false,
        };
        setBanner(`Backend unavailable. Created ${fallbackId} locally.`);
      }

      setOrders((prev) => [newOrder, ...prev]);
      setSelectedOrderId(newOrder.id);
      setNewOrderCustomer("");
      setNewOrderMobile("");
      setNewOrderType("Dine-In");
      setNewOrderFlatNo("");
      setNewOrderRoomNo("");
      setNewOrderLandmark("");
      setNewOrderAutoLocation("");
      setNewOrderTableId(null);
      setCandidateTableId(null);
    } catch {
      setBanner("Could not save new order. Try again.");
    } finally {
      setIsSavingNewOrder(false);
    }
  }

  async function handleTableEntrySelection(tableId: string) {
    if (isSelectingTableEntry) {
      return;
    }

    const selectedTable = tables.find((table) => table.id === tableId);
    if (!selectedTable) {
      setBanner("Table not found.");
      return;
    }

    const existingOpenOrder = openOrders.find((order) => order.tableId === tableId);
    if (existingOpenOrder) {
      setSelectedOrderId(existingOpenOrder.id);
      setNewOrderTableId(tableId);
      setCandidateTableId(tableId);
      setShowTableEntry(false);
      router.push(`/bill?table=${encodeURIComponent(tableId)}`);
      setBanner(`Opened ${existingOpenOrder.id} on ${tableId}.`);
      return;
    }

    setIsSelectingTableEntry(true);
    setShowTableEntry(false);
    setNewOrderType("Dine-In");
    setNewOrderTableId(tableId);
    setCandidateTableId(tableId);
    router.push(`/bill?table=${encodeURIComponent(tableId)}`);

    const tempOrderId = `#TMP-${String(Date.now()).slice(-6)}`;
    const optimisticOrder: BillOrder = {
      id: tempOrderId,
      customer: "Guest",
      type: "Dine-In",
      amount: 0,
      itemCount: 0,
      elapsed: "Now",
      mobile: "",
      section: "AC",
      persons: 1,
      tableId,
      deliveryAddress: null,
      payment: "None",
      splitPayment: null,
      items: [],
      settled: false,
      paymentStatus: "pending",
      preparationStatus: "pending",
      unpaidAmountCleared: false,
    };

    setOrders((prev) => [optimisticOrder, ...prev]);
    setSelectedOrderId(tempOrderId);
    setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, status: "Occupied" } : table)));

    try {
      const payload = {
        customer: "Guest",
        mobile: "",
        type: "Dine-In" as OrderType,
        section: "AC" as SectionType,
        persons: 1,
        tableId,
        deliveryAddress: null,
        payment: "None",
        splitPayment: null,
        items: [] as BackendOrderItem[],
        settled: false,
      };

      const createdResponse = await postWithFallback<typeof payload, unknown>(
        ["/api/pos/orders", "/api/orders", "/orders"],
        payload,
      );

      let newOrder: BillOrder;
      const createdOrder = extractCreatedOrder(createdResponse);

      if (createdOrder) {
        newOrder = mapOrderFromBackend(createdOrder, orders.length + 1);
        if (!newOrder.elapsed) {
          newOrder.elapsed = "Now";
        }

        void patchWithFallback<{ orderId: string }, { table?: BackendTable }>(
          [`/api/pos/tables/${tableId}/assign`, `/api/tables/${tableId}/assign`, `/tables/${tableId}/assign`],
          { orderId: newOrder.id },
        );

        setBanner(`Started ${newOrder.id} on ${tableId}.`);
      } else {
        const fallbackId = `#N-${String(Date.now()).slice(-6)}`;
        newOrder = {
          id: fallbackId,
          customer: "Guest",
          type: "Dine-In",
          amount: 0,
          itemCount: 0,
          elapsed: "Now",
          mobile: "",
          section: "AC",
          persons: 1,
          tableId,
          deliveryAddress: null,
          payment: "None",
          splitPayment: null,
          items: [],
          settled: false,
          paymentStatus: "pending",
          preparationStatus: "pending",
          unpaidAmountCleared: false,
        };
        setBanner(`Backend unavailable. Started ${fallbackId} on ${tableId}.`);
      }

      setOrders((prev) =>
        prev.map((order) => (order.id === tempOrderId ? newOrder : order)),
      );
      setSelectedOrderId(newOrder.id);
    } catch {
      setBanner("Could not open table right now. Try again.");
      setOrders((prev) => prev.filter((order) => order.id !== tempOrderId));
      setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, status: "Available" } : table)));
      setShowTableEntry(true);
    } finally {
      setIsSelectingTableEntry(false);
    }
  }

  async function handleQuickSaveTable(tableId: string) {
    const orderOnTable = openOrders.find((order) => order.tableId === tableId);
    if (!orderOnTable) {
      setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, status: "Available" } : table)));
      setBanner(`${tableId} is ready for next order.`);
      return;
    }

    const settledOrder: BillOrder = {
      ...orderOnTable,
      settled: true,
      elapsed: "Settled",
      payment: orderOnTable.payment === "None" ? "Cash" : orderOnTable.payment,
      paymentStatus: "paid",
    };

    setOrders((prev) => prev.map((order) => (order.id === settledOrder.id ? settledOrder : order)));
    setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, status: "Available" } : table)));
    setSelectedOrderId((prev) => (prev === settledOrder.id ? "" : prev));
    setBanner(`${settledOrder.id} saved. ${tableId} is ready for next order.`);

    void (async () => {
      const persisted = await persistOrderToBackend(settledOrder);
      if (!persisted) {
        setBanner(`${settledOrder.id} saved locally. Backend sync pending.`);
        return;
      }

      await patchWithFallback<{ payment: PaymentType; splitPayment: SplitPayment | null }, unknown>(
        [`/api/pos/orders/${encodeURIComponent(settledOrder.id)}/settle`, `/api/orders/${encodeURIComponent(settledOrder.id)}/settle`, `/orders/${encodeURIComponent(settledOrder.id)}/settle`],
        {
          payment: settledOrder.payment,
          splitPayment: settledOrder.payment === "Split" ? settledOrder.splitPayment : null,
        },
      );

      await patchWithFallback<{ orderId: string }, unknown>(
        [`/api/pos/tables/${tableId}/release`, `/api/tables/${tableId}/release`, `/tables/${tableId}/release`],
        { orderId: settledOrder.id },
      );
    })();
  }

  function handleQuickViewTable(tableId: string) {
    const orderOnTable = openOrders.find((order) => order.tableId === tableId);
    const status = tables.find((t) => t.id === tableId)?.status ?? "Available";
    setQuickViewData({ tableId, status, order: orderOnTable ?? null });
  }

  function handleQuickUpdateTable(tableId: string) {
    const current = tables.find((table) => table.id === tableId)?.status ?? "Available";
    setQuickUpdateTableId(tableId);
    setQuickUpdateStatus(current);
  }

  async function handleApplyQuickUpdate(tableId: string) {
    if (!quickUpdateStatus) {
      return;
    }

    await updateTableStatus(tableId, quickUpdateStatus);
    setQuickUpdateTableId(null);
  }

  if (showTableEntry) {
    return (
      <div className={`min-h-screen ${palette.shell}`}>
        <div className={`fixed inset-0 -z-10 ${palette.backdrop}`} />
        <div className="flex min-h-screen">
          <BillSidebar isDark={isDark} />

          <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-1 flex-col px-4 py-8 md:px-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.22em] ${isDark ? "text-[#ff9f8f]/80" : "text-[#cc4b3e]/80"}`}>Restaurant POS</p>
                <h1 className={`mt-1 text-2xl font-semibold md:text-3xl ${palette.textStrong}`}>Select Table First</h1>
                <p className={`mt-2 text-sm ${palette.textMuted}`}>Pick a table to open billing. Occupied tables with active orders can be reopened.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(true)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${palette.headerPill}`}
                >
                  Add Table
                </button>
                <button
                  type="button"
                  onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${palette.headerPill}`}
                >
                  {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                  {isDark ? "Light" : "Dark"}
                </button>
              </div>
            </div>

            {banner ? (
              <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${palette.panelSoft}`}>
                {banner}
              </div>
            ) : null}

            <div className={`rounded-3xl border p-4 md:p-6 ${palette.panel}`}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {tables.map((table) => {
                  const orderOnTable = openOrders.find((order) => order.tableId === table.id);
                  const canOpen = true;
                  const isOccupied = table.status === "Occupied";

                  return (
                    <div
                      key={table.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!canOpen || isSelectingTableEntry) {
                          return;
                        }
                        void handleTableEntrySelection(table.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          if (!canOpen || isSelectingTableEntry) {
                            return;
                          }
                          void handleTableEntrySelection(table.id);
                        }
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        canOpen
                          ? palette.gridCard
                          : isDark
                            ? "border-white/8 bg-white/[0.03] text-slate-400"
                            : "border-black/5 bg-white/70 text-slate-500"
                      } ${canOpen ? "hover:scale-[1.01] cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-base font-semibold ${palette.textStrong}`}>{table.label}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            table.status === "Available"
                              ? isDark
                                ? "bg-emerald-300/15 text-emerald-100"
                                : "bg-emerald-100 text-emerald-700"
                              : table.status === "Cleaning"
                                ? isDark
                                  ? "bg-amber-300/15 text-amber-100"
                                  : "bg-amber-100 text-amber-800"
                              : table.status === "Reserved"
                                ? isDark
                                  ? "bg-sky-300/15 text-sky-100"
                                  : "bg-sky-100 text-sky-800"
                                : isDark
                                  ? "bg-rose-300/15 text-rose-100"
                                  : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {table.status}
                        </span>
                      </div>

                      <p className={`mt-4 text-sm ${palette.textMuted}`}>
                          {orderOnTable
                          ? `Open ${orderOnTable.id}`
                          : table.status === "Cleaning"
                            ? "Start from Cleaning"
                            : table.status === "Reserved"
                              ? "Reserved"
                            : table.status === "Available"
                              ? "Start Order"
                              : "Start / Reassign"}
                      </p>

                      <div className={`mt-3 inline-flex w-full items-center ${isOccupied ? "justify-between" : "justify-end"} border-t pt-2 text-[10px] ${isDark ? "border-white/10" : "border-black/10"} ${palette.textMuted}`}>
                        {isOccupied ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleQuickViewTable(table.id);
                            }}
                            className="inline-flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleQuickUpdateTable(table.id);
                          }}
                          className="inline-flex items-center gap-1"
                        >
                          <RefreshCcw className="h-3 w-3" />
                          Update
                        </button>
                        {isOccupied ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleQuickSaveTable(table.id);
                            }}
                            className="inline-flex items-center gap-1"
                          >
                            <Save className="h-3 w-3" />
                            Saved
                          </button>
                        ) : null}
                      </div>

                      {quickUpdateTableId === table.id ? (
                        <div
                          className={`mt-2 rounded-lg border p-2 ${isDark ? "border-white/15 bg-[#0f1627]" : "border-black/10 bg-white"}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <select
                            value={quickUpdateStatus}
                            onChange={(event) => setQuickUpdateStatus(event.target.value as TableStatus)}
                            className={`w-full rounded-md border px-2 py-1.5 text-[11px] font-medium outline-none ${
                              isDark
                                ? "border-white/20 bg-[#1a2338] text-white"
                                : "border-black/15 bg-white text-slate-900"
                            }`}
                          >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Reserved">Reserved</option>
                          </select>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                void handleApplyQuickUpdate(table.id);
                              }}
                              className={`w-full rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
                                isDark
                                  ? "border border-emerald-300/40 bg-emerald-300/20 text-emerald-100"
                                  : "border border-emerald-500/30 bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              Apply
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickUpdateTableId(null)}
                              className={`w-full rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
                                isDark
                                  ? "border border-white/20 bg-[#1a2338] text-slate-100"
                                  : "border border-black/15 bg-white text-slate-700"
                              }`}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {quickViewData ? (
              <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/70 p-4">
                <div className={`w-full max-w-md rounded-2xl border p-4 shadow-[0_28px_70px_rgba(2,6,23,0.7)] ${isDark ? "border-white/30 bg-[#10192d]" : "border-black/20 bg-white"}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Table {quickViewData.tableId} Details</h3>
                    <button
                      type="button"
                      onClick={() => setQuickViewData(null)}
                      className={`rounded-lg border p-1.5 ${isDark ? "border-white/25 bg-white/10 text-white" : "border-black/15 bg-white text-slate-800"}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className={`space-y-2 text-sm ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    <p>Status: <span className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>{quickViewData.status}</span></p>
                    {quickViewData.order ? (
                      <>
                        <p>Order No: <span className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>{quickViewData.order.id}</span></p>
                        <p>Customer: <span className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>{quickViewData.order.customer || "Guest"}</span></p>
                        <p>Items: <span className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>{quickViewData.order.itemCount}</span></p>
                        <p>Amount: <span className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>{money(quickViewData.order.amount)}</span></p>
                      </>
                    ) : (
                      <p>No active order on this table.</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuickViewData(null)}
                    className={`mt-4 w-full rounded-xl border px-3 py-2 text-sm font-semibold ${isDark ? "border-white/25 bg-white/10 text-white" : "border-black/15 bg-white text-slate-900"}`}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${palette.shell}`}>
      <div className={`fixed inset-0 -z-10 ${palette.backdrop}`} />

      <div className="flex min-h-screen">
        <aside className={`hidden w-28 flex-col p-3 backdrop-blur-xl lg:flex ${palette.sidebar}`}>
          <div className={`mb-4 rounded-2xl border p-3 text-center shadow-[0_12px_30px_rgba(0,0,0,0.2)] ${isDark ? "border-white/8 bg-white/[0.06]" : "border-black/5 bg-white"}`}>
            <p className={`text-xs font-semibold tracking-[0.2em] ${palette.sidebarBrand}`}>POS</p>
          </div>

          <nav className="space-y-2 text-xs">
            {[
              { label: "Tables", icon: UtensilsCrossed, href: "/bill?view=tables" },
              { label: "Billing", icon: FileText, href: "/bill" },
              { label: "Operations", icon: ClipboardList, href: "/bill/operations" },
              { label: "Reports", icon: BarChart3, href: "/bill/reports" },
              { label: "Live View", icon: PieChart, href: "/bill/live-view" },
              { label: "Settings", icon: Settings, href: "/bill/settings" },
              { label: "Menu Settings", icon: UtensilsCrossed, href: "/bill/menu-settings" },
            ].map((entry) => {
              const isTablesView = entry.href === "/bill?view=tables";
              const isActive = isTablesView
                ? pathname === "/bill" && searchParams.get("view") === "tables"
                : pathname === entry.href || pathname.startsWith(`${entry.href}/`);

              return (
                <Link
                  key={entry.label}
                  href={entry.href}
                  className={`flex w-full flex-col items-center gap-1 rounded-xl border p-2.5 text-center leading-tight transition ${
                    isActive ? palette.sidebarActive : palette.sidebarItem
                  }`}
                >
                  <entry.icon className="h-5 w-5" />
                  <span>{entry.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className={`relative z-[120] border-b px-4 py-3.5 backdrop-blur-md md:px-6 ${palette.header}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.22em] ${isDark ? "text-[#ff9f8f]/80" : "text-[#cc4b3e]/80"}`}>Restaurant POS</p>
                <h1 className={`text-2xl font-semibold md:text-3xl ${palette.textStrong}`}>Live Billing Desk</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${palette.headerPill}`}
                >
                  {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                  {isDark ? "Light" : "Dark"}
                </button>
                <div className={`rounded-2xl px-4 py-2 text-sm ${palette.headerPill}`}>
                  {currentOrder ? `Order ${currentOrder.id}` : "No active orders"}
                </div>
              </div>
            </div>

          </header>

          <div className="relative z-[10] grid flex-1 gap-4 p-4 md:grid-cols-[0.72fr_0.9fr_1.2fr] md:p-5">
            <section className={`rounded-[28px] p-3.5 backdrop-blur-lg ${palette.panel}`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className={palette.textStrong}>Saved Orders</h2>
                <span className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-[#ff9f8f]" : "text-[#cc4b3e]"}`}>History</span>
              </div>
              <OrderHistoryPanel
                isDark={isDark}
                embedded
                orders={orders.filter((order) => order.settled || order.preparationStatus === "prepared")}
              />
            </section>

            <ActiveOrdersPanel
              isDark={isDark}
              palette={palette}
              openOrders={openOrders}
              currentOrderId={currentOrder?.id}
              money={money}
              newOrderCustomer={newOrderCustomer}
              newOrderMobile={newOrderMobile}
              newOrderType={newOrderType}
              newOrderFlatNo={newOrderFlatNo}
              newOrderRoomNo={newOrderRoomNo}
              newOrderLandmark={newOrderLandmark}
              newOrderAutoLocation={newOrderAutoLocation}
              tables={tables}
              newOrderTableId={newOrderTableId}
              isSavingNewOrder={isSavingNewOrder}
              onCustomerChange={setNewOrderCustomer}
              onMobileChange={setNewOrderMobile}
              onTypeChange={handleNewOrderTypeChange}
              onFlatNoChange={setNewOrderFlatNo}
              onRoomNoChange={setNewOrderRoomNo}
              onLandmarkChange={setNewOrderLandmark}
              onDetectLocation={detectNewOrderLocation}
              onNewOrderTableChange={setNewOrderTableId}
              onOpenTableView={() => {
                if (newOrderType !== "Dine-In") {
                  return;
                }
                setCandidateTableId(newOrderTableId);
                setShowTableModal(true);
              }}
              onCreateOrder={handleCreateOrder}
              onSelectOrder={setSelectedOrderId}
            />

            <BillEditorPanel
              isDark={isDark}
              palette={palette}
              orderType={currentOrderType}
              section={currentOrderSection}
              tableId={currentOrderTableId}
              persons={currentOrderPersons}
              mobile={mobile}
              customerName={customerName}
              menuSearch={menuSearch}
              filteredMenuItems={filteredMenuItems}
              menuSettingsItems={menuSettingsItems}
              menuAvailability={menuAvailability}
              items={items}
              subtotal={subtotal}
              tax={tax}
              grandTotal={grandTotal}
              payment={payment}
              splitPayment={currentOrder?.splitPayment ?? null}
              hasCurrentOrder={Boolean(currentOrder)}
              onMobileChange={(value) => updateCurrentOrder({ mobile: value })}
              onCustomerNameChange={(value) => updateCurrentOrder({ customer: value })}
              onOrderTypeChange={handleCurrentOrderTypeChange}
              onSectionChange={handleCurrentOrderSectionChange}
              onPersonsChange={handleCurrentOrderPersonsChange}
              onOpenTableView={() => {
                setCandidateTableId(currentOrder?.tableId ?? null);
                setShowTableModal(true);
              }}
              onMenuSearchChange={setMenuSearch}
              onMenuAvailabilityChange={toggleMenuAvailability}
              onAddItem={addItem}
              onUpdateQty={updateQty}
              onPaymentChange={(value) => {
                if (!currentOrder) {
                  return;
                }

                const nextSplit = value === "Split"
                  ? (currentOrder.splitPayment ?? { cash: 0, upi: 0 })
                  : null;

                updateCurrentOrder({
                  payment: value,
                  splitPayment: nextSplit,
                });

                void persistPaymentDetails(currentOrder.id, value, nextSplit);
              }}
              onSplitPaymentChange={(value) => {
                if (!currentOrder) {
                  return;
                }

                updateCurrentOrder({ splitPayment: value });
                void persistPaymentDetails(currentOrder.id, "Split", value);
              }}
              onSaveAndPrint={handleSaveAndPrint}
              onSaveAndEbill={handleSaveAndEbill}
              onSettleAndSave={handleSettleAndSave}
              onKOT={handleCreateKOT}
              onKOTPrint={handleCreateKOTAndPrint}
              isSavingAndPrinting={activeBillAction === "savePrint"}
              isSavingAndEbill={activeBillAction === "saveEbill"}
              isSettlingAndSaving={activeBillAction === "settle"}
              isCreatingKOT={activeBillAction === "kot"}
              isCreatingKOTPrint={activeBillAction === "kotPrint"}
              money={money}
            />
          </div>
        </div>
      </div>

      <TableManagementModal
        show={showTableModal}
        onClose={() => setShowTableModal(false)}
        isDark={isDark}
        palette={palette}
        tables={tables}
        selectedTableLabel={selectedNewOrderTable?.label}
        selectedTableId={newOrderTableId}
        candidateTableId={candidateTableId}
        tableStats={tableStats}
        newTableLabel={newTableLabel}
        newTableStatus={newTableStatus}
        onNewTableLabelChange={setNewTableLabel}
        onNewTableStatusChange={setNewTableStatus}
        onAddTable={addNewTable}
        onSelectTable={selectTable}
        onToggleStatus={toggleTableStatus}
        onDeleteTable={deleteTable}
        onConfirmCurrentOrderTable={confirmSelectedTable}
      />

     
    </div>
  );
}
