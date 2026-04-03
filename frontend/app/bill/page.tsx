"use client";

import { Listbox } from "@headlessui/react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  FileText,
  Home as HomeIcon,
  IndianRupee,
  MoonStar,
  PieChart,
  Settings,
  ShoppingBag,
  TableProperties,
  Truck,
  SunMedium,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActiveOrdersPanel } from "@/components/bill/ActiveOrdersPanel";
import { BillEditorPanel } from "@/components/bill/BillEditorPanel";
import { TableManagementModal } from "@/components/bill/TableManagementModal";
import type { BillOrder, MenuItem, OrderItem, OrderType, Palette, PaymentType, SectionType, TableNode, TableStatus } from "@/components/bill/types";

type BackendMenuItem = {
  id?: string | number;
  name?: string;
  price?: number;
  tag?: string;
  category?: string;
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
  tableId?: string;
  payment?: string;
  paymentType?: string;
  items?: BackendOrderItem[];
  settled?: boolean;
};

const sections: SectionType[] = ["AC", "Non-AC", "Rooftop"];
const initialOrders: BillOrder[] = [
  {
    id: "#21635",
    customer: "Mohsin",
    type: "Dine-In",
    amount: 378,
    itemCount: 3,
    elapsed: "08m",
    mobile: "9740720936",
    section: "AC",
    tableId: "T2",
    payment: "UPI",
    items: [
      { id: "m1", name: "French Fries", qty: 1, price: 180 },
      { id: "m4", name: "Masala Soda", qty: 2, price: 90 },
    ],
    settled: false,
  },
  {
    id: "#21636",
    customer: "Aarav",
    type: "Takeaway",
    amount: 350,
    itemCount: 1,
    elapsed: "04m",
    mobile: "9876543210",
    section: "Non-AC",
    tableId: null,
    payment: "Cash",
    items: [{ id: "m5", name: "Margherita", qty: 1, price: 350 }],
    settled: false,
  },
  {
    id: "#21637",
    customer: "Sana",
    type: "Delivery",
    amount: 410,
    itemCount: 2,
    elapsed: "12m",
    mobile: "9966554433",
    section: "Rooftop",
    tableId: null,
    payment: "Card",
    items: [
      { id: "m2", name: "Paneer Tikka", qty: 1, price: 320 },
      { id: "m4", name: "Masala Soda", qty: 1, price: 90 },
    ],
    settled: false,
  },
  {
    id: "#21638",
    customer: "Riya",
    type: "Dine-In",
    amount: 400,
    itemCount: 2,
    elapsed: "06m",
    mobile: "9822334455",
    section: "AC",
    tableId: "T8",
    payment: "UPI",
    items: [
      { id: "m6", name: "Choco Lava", qty: 1, price: 210 },
      { id: "m4", name: "Masala Soda", qty: 1, price: 90 },
    ],
    settled: false,
  },
];

const quickMenu: MenuItem[] = [
  { id: "m1", name: "French Fries", price: 180, tag: "Fast" },
  { id: "m2", name: "Paneer Tikka", price: 320, tag: "Starter" },
  { id: "m3", name: "Veg Burger", price: 220, tag: "Combo" },
  { id: "m4", name: "Masala Soda", price: 90, tag: "Drink" },
  { id: "m5", name: "Margherita", price: 350, tag: "Pizza" },
  { id: "m6", name: "Choco Lava", price: 210, tag: "Dessert" },
];

const initialTables: TableNode[] = [
  { id: "T1", label: "T1", status: "Occupied" },
  { id: "T2", label: "T2", status: "Available" },
  { id: "T3", label: "T3", status: "Available" },
  { id: "T4", label: "T4", status: "Occupied" },
  { id: "T5", label: "T5", status: "Available" },
  { id: "T6", label: "T6", status: "Occupied" },
  { id: "T7", label: "T7", status: "Available" },
  { id: "T8", label: "T8", status: "Available" },
];

const orderTypeMeta: Record<OrderType, { icon: React.ComponentType<{ className?: string }> }> = {
  Delivery: { icon: Truck },
  Takeaway: { icon: ShoppingBag },
  "Dine-In": { icon: HomeIcon },
};

const POS_API_BASE_URL = process.env.NEXT_PUBLIC_POS_API_BASE_URL ?? "http://localhost:8000";

function normalizeOrderType(value: string | undefined): OrderType {
  if (value === "Delivery" || value === "Takeaway" || value === "Dine-In") {
    return value;
  }
  return "Dine-In";
}

function normalizePayment(value: string | undefined): PaymentType {
  if (value === "Cash" || value === "Card" || value === "UPI") {
    return value;
  }
  return "UPI";
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

  return { id, name, price, tag };
}

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
    tableId: order.tableId ?? null,
    payment: normalizePayment(order.payment ?? order.paymentType),
    items,
    settled: Boolean(order.settled),
  };
}

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

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const isThemeReadyRef = useRef(false);
  const [orders, setOrders] = useState<BillOrder[]>(initialOrders);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(quickMenu);
  const [tables, setTables] = useState<TableNode[]>(initialTables);
  const [menuSearch, setMenuSearch] = useState("");
  const [newOrderCustomer, setNewOrderCustomer] = useState("");
  const [newOrderMobile, setNewOrderMobile] = useState("");
  const [newOrderType, setNewOrderType] = useState<OrderType>("Dine-In");
  const [isSavingNewOrder, setIsSavingNewOrder] = useState(false);
  const [newTableLabel, setNewTableLabel] = useState("");
  const [newTableStatus, setNewTableStatus] = useState<TableStatus>("Available");
  const [candidateTableId, setCandidateTableId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrders[0].id);
  const [showTableModal, setShowTableModal] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const openOrders = useMemo(() => orders.filter((order) => !order.settled), [orders]);
  const filteredMenuItems = useMemo(() => {
    const query = menuSearch.trim().toLowerCase();
    if (!query) {
      return menuItems;
    }

    return menuItems.filter((item) => {
      const searchable = `${item.name} ${item.tag}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [menuItems, menuSearch]);

  const tableStats = useMemo(() => {
    const occupied = tables.filter((table) => table.status === "Occupied").length;
    return {
      occupied,
      available: tables.length - occupied,
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
    let isMounted = true;

    async function loadBackendData() {
      const [ordersResponse, menuResponse] = await Promise.all([
        fetchWithFallback<BackendOrder[] | { data: BackendOrder[] }>(["/api/pos/orders/active", "/api/orders/active", "/orders/active"]),
        fetchWithFallback<BackendMenuItem[] | { data: BackendMenuItem[] }>(["/api/pos/menu", "/api/menu", "/menu"]),
      ]);

      if (!isMounted) {
        return;
      }

      const parsedOrders = Array.isArray(ordersResponse)
        ? ordersResponse
        : Array.isArray(ordersResponse?.data)
          ? ordersResponse.data
          : [];
      const parsedMenu = Array.isArray(menuResponse)
        ? menuResponse
        : Array.isArray(menuResponse?.data)
          ? menuResponse.data
          : [];

      if (parsedOrders.length > 0) {
        const nextOrders = parsedOrders.map(mapOrderFromBackend);
        setOrders(nextOrders);
        setSelectedOrderId(nextOrders[0]?.id ?? "");
      }

      if (parsedMenu.length > 0) {
        setMenuItems(parsedMenu.map(mapMenuFromBackend));
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

  const orderType = currentOrder?.type ?? "Dine-In";
  const section = currentOrder?.section ?? "AC";
  const payment = currentOrder?.payment ?? "UPI";
  const mobile = currentOrder?.mobile ?? "";
  const customerName = currentOrder?.customer ?? "";
  const items = useMemo(() => currentOrder?.items ?? [], [currentOrder]);
  const selectedTable = currentOrder?.tableId
    ? tables.find((table) => table.id === currentOrder.tableId) ?? null
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

  function toggleTableStatus(tableId: string) {
    const target = tables.find((table) => table.id === tableId);
    if (!target) {
      return;
    }

    const nextStatus: TableStatus = target.status === "Occupied" ? "Available" : "Occupied";

    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId
          ? { ...table, status: nextStatus }
          : table,
      ),
    );

    if (nextStatus === "Available") {
      setOrders((prev) =>
        prev.map((order) =>
          !order.settled && order.tableId === tableId
            ? { ...order, tableId: null }
            : order,
        ),
      );
    }
  }

  function addNewTable() {
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

    setTables((prev) => [
      ...prev,
      {
        id: normalizedLabel,
        label: normalizedLabel,
        status: newTableStatus,
      },
    ]);

    setNewTableLabel("");
    setNewTableStatus("Available");
    setBanner(`Added ${normalizedLabel} as ${newTableStatus.toLowerCase()}.`);
  }

  function selectTable(tableId: string) {
    if (!currentOrder) {
      return;
    }

    const selected = tables.find((table) => table.id === tableId);
    if (!selected) {
      return;
    }

    const sameTable = currentOrder.tableId === tableId;
    if (selected.status === "Occupied" && !sameTable) {
      setBanner(`Table ${tableId} is already occupied.`);
      return;
    }

    setCandidateTableId(tableId);
    setBanner(`Selected table ${tableId}. Confirm to assign.`);
  }

  function confirmSelectedTable() {
    if (!currentOrder) {
      return;
    }

    if (!candidateTableId) {
      setBanner("Select a table first.");
      return;
    }

    const tableId = candidateTableId;
    const selected = tables.find((table) => table.id === tableId);
    if (!selected) {
      return;
    }

    const sameTable = currentOrder.tableId === tableId;
    if (selected.status === "Occupied" && !sameTable) {
      setBanner(`Table ${tableId} is already occupied.`);
      return;
    }

    const previousTableId = currentOrder.tableId;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === currentOrder.id ? { ...order, tableId } : order,
      ),
    );

    setTables((prev) =>
      prev.map((table) => {
        if (table.id === tableId) {
          return { ...table, status: "Occupied" };
        }

        if (
          previousTableId &&
          table.id === previousTableId &&
          previousTableId !== tableId
        ) {
          const stillUsedByOtherOrder = orders.some(
            (order) =>
              !order.settled &&
              order.id !== currentOrder.id &&
              order.tableId === previousTableId,
          );

          if (!stillUsedByOtherOrder) {
            return { ...table, status: "Available" };
          }
        }

        return table;
      }),
    );

    setBanner(`Assigned table ${tableId} to the active order.`);
  }

  useEffect(() => {
    setCandidateTableId(currentOrder?.tableId ?? null);
  }, [currentOrder?.id, currentOrder?.tableId]);

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
    updateCurrentOrder((order) => {
      const exists = order.items.find((entry) => entry.id === menuItem.id);
      if (exists) {
        return {
          items: order.items.map((entry) =>
            entry.id === menuItem.id ? { ...entry, qty: entry.qty + 1 } : entry,
          ),
        };
      }
      return {
        items: [...order.items, { id: menuItem.id, name: menuItem.name, qty: 1, price: menuItem.price }],
      };
    });
  }

  function updateQty(id: string, delta: number) {
    updateCurrentOrder((order) => ({
      items: order.items
        .map((entry) =>
          entry.id === id ? { ...entry, qty: Math.max(0, entry.qty + delta) } : entry,
        )
        .filter((entry) => entry.qty > 0),
    }));
  }

  function handleSettleAndSave() {
    if (!currentOrder) {
      return;
    }

    const tableId = currentOrder.tableId;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === currentOrder.id
          ? { ...order, settled: true, elapsed: "Settled" }
          : order,
      ),
    );

    if (tableId) {
      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId ? { ...table, status: "Available" } : table,
        ),
      );
    }

    setCandidateTableId(null);

    setBanner(`${currentOrder.id} settled via ${payment}.`);
  }

  function handleSaveAndPrint() {
    if (!currentOrder) {
      return;
    }

    setBanner(`${currentOrder.id} saved.`);
    if (typeof window !== "undefined") {
      window.print();
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

    const payload = {
      customer,
      mobile: mobileValue,
      type: newOrderType,
      section: "AC",
      payment: "UPI",
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
        tableId: null,
        payment: "UPI",
        items: [],
        settled: false,
      };
      setBanner(`Backend unavailable. Created ${fallbackId} locally.`);
    }

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    setNewOrderCustomer("");
    setNewOrderMobile("");
    setNewOrderType("Dine-In");
    setIsSavingNewOrder(false);
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
              { label: "Billing", icon: FileText, href: "/bill" },
              { label: "Operations", icon: ClipboardList, href: "/bill/operations" },
              { label: "Reports", icon: BarChart3, href: "/bill/reports" },
              { label: "Live View", icon: PieChart, href: "/bill/live-view" },
              { label: "Settings", icon: Settings, href: "/bill/settings" },
            ].map((entry) => {
              const isActive = pathname === entry.href || pathname.startsWith(`${entry.href}/`);

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

            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <div className={`relative inline-flex rounded-2xl border p-1 bg-transparent ${palette.panel}`}>
                {(["Delivery", "Takeaway", "Dine-In"] as OrderType[]).map((type) => {
                  const Icon = orderTypeMeta[type].icon;
                  const active = orderType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        updateCurrentOrder({
                          type,
                          tableId: type === "Dine-In" ? currentOrder?.tableId ?? null : null,
                        })
                      }
                      className="relative z-10 inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium"
                    >
                      {active ? (
                        <motion.span
                          layoutId="orderTypePill"
                          className={`absolute inset-0 -z-10 rounded-xl ${palette.orderPill}`}
                          transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        />
                      ) : null}
                      <Icon className={`h-4 w-4 ${active ? palette.orderText : "text-slate-500"}`} />
                      <span className={active ? palette.orderText : "text-slate-600"}>{type}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {orderType === "Dine-In" ? (
                  <motion.div
                    key="dine-controls"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <Listbox value={section} onChange={(nextSection) => updateCurrentOrder({ section: nextSection })}>
                      <div className="relative z-[140]">
                        <Listbox.Button className={`relative z-[141] inline-flex min-w-32 items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm backdrop-blur-md ${palette.sectionButton}`}>
                          <span>Section: {section}</span>
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        </Listbox.Button>
                        <Listbox.Options className={`absolute z-[160] mt-1 w-full rounded-xl p-1 text-sm backdrop-blur-xl shadow-[0_18px_40px_rgba(2,6,23,0.35)] ${palette.sectionMenu}`}>
                          {sections.map((option) => (
                            <Listbox.Option
                              key={option}
                              value={option}
                              className={({ active }) =>
                                `cursor-pointer rounded-lg px-3 py-2 ${active ? palette.sectionActive : palette.textMuted}`
                              }
                            >
                              {option}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </Listbox>

                    <button
                      type="button"
                      onClick={() => setShowTableModal(true)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${palette.selectTable}`}
                    >
                      <TableProperties className="h-4 w-4" />
                      {selectedTable ? `Table: ${selectedTable.label}` : "Select table"}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="non-dine-note"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`rounded-xl border px-3 py-2 text-sm ${palette.panelSoft} ${palette.textMuted}`}
                  >
                    {orderType === "Delivery" ? "Assign delivery partner" : "Counter pickup mode active"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          <div className="relative z-[10] grid flex-1 gap-4 p-4 md:grid-cols-[0.82fr_1.18fr] md:p-5">
            <ActiveOrdersPanel
              isDark={isDark}
              palette={palette}
              openOrders={openOrders}
              currentOrderId={currentOrder?.id}
              money={money}
              newOrderCustomer={newOrderCustomer}
              newOrderMobile={newOrderMobile}
              newOrderType={newOrderType}
              isSavingNewOrder={isSavingNewOrder}
              onCustomerChange={setNewOrderCustomer}
              onMobileChange={setNewOrderMobile}
              onTypeChange={setNewOrderType}
              onCreateOrder={handleCreateOrder}
              onSelectOrder={setSelectedOrderId}
            />

            <BillEditorPanel
              isDark={isDark}
              palette={palette}
              mobile={mobile}
              customerName={customerName}
              menuSearch={menuSearch}
              filteredMenuItems={filteredMenuItems}
              items={items}
              subtotal={subtotal}
              tax={tax}
              grandTotal={grandTotal}
              payment={payment}
              hasCurrentOrder={Boolean(currentOrder)}
              onMobileChange={(value) => updateCurrentOrder({ mobile: value })}
              onCustomerNameChange={(value) => updateCurrentOrder({ customer: value })}
              onMenuSearchChange={setMenuSearch}
              onAddItem={addItem}
              onUpdateQty={updateQty}
              onPaymentChange={(value) => updateCurrentOrder({ payment: value })}
              onSaveAndPrint={handleSaveAndPrint}
              onSettleAndSave={handleSettleAndSave}
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
        selectedTableLabel={selectedTable?.label}
        selectedTableId={currentOrder?.tableId}
        candidateTableId={candidateTableId}
        tableStats={tableStats}
        newTableLabel={newTableLabel}
        newTableStatus={newTableStatus}
        onNewTableLabelChange={setNewTableLabel}
        onNewTableStatusChange={setNewTableStatus}
        onAddTable={addNewTable}
        onSelectTable={selectTable}
        onToggleStatus={toggleTableStatus}
        onConfirmCurrentOrderTable={confirmSelectedTable}
      />

      <div className={`fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${palette.floatingBadge}`}>
        <IndianRupee className="h-3.5 w-3.5" />
        {banner ?? "Synced and live"}
      </div>
    </div>
  );
}
