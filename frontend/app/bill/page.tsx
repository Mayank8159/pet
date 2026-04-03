"use client";

import axios from "axios";
import {
  BarChart3,
  ClipboardList,
  FileText,
  IndianRupee,
  MoonStar,
  PieChart,
  Settings,
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
    paymentStatus: order.paymentStatus === "paid" ? "paid" : "pending",
    preparationStatus: order.preparationStatus === "prepared" ? "prepared" : "pending",
    unpaidAmountCleared: Boolean(order.unpaidAmountCleared),
  };
}

function mapTableFromBackend(table: BackendTable, index: number): TableNode {
  const resolvedId = String(table.id ?? table.tableId ?? `T${index + 1}`).toUpperCase();
  const resolvedLabel = (table.label?.trim() || resolvedId).toUpperCase();
  const resolvedStatus: TableStatus = table.status === "Occupied" ? "Occupied" : "Available";

  return {
    id: resolvedId,
    label: resolvedLabel,
    status: resolvedStatus,
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
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const isThemeReadyRef = useRef(false);
  const [orders, setOrders] = useState<BillOrder[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableNode[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [newOrderCustomer, setNewOrderCustomer] = useState("");
  const [newOrderMobile, setNewOrderMobile] = useState("");
  const [newOrderType, setNewOrderType] = useState<OrderType>("Dine-In");
  const [newOrderTableId, setNewOrderTableId] = useState<string | null>(null);
  const [isSavingNewOrder, setIsSavingNewOrder] = useState(false);
  const [newTableLabel, setNewTableLabel] = useState("");
  const [newTableStatus, setNewTableStatus] = useState<TableStatus>("Available");
  const [candidateTableId, setCandidateTableId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [showTableModal, setShowTableModal] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const openOrders = useMemo(() => orders.filter((order) => !order.settled), [orders]);
  const filteredMenuItems = useMemo(() => {
    const query = menuSearch.trim().toLowerCase();
    const sourceItems = query ? (allMenuItems.length > 0 ? allMenuItems : menuItems) : menuItems;

    if (!query) {
      return sourceItems;
    }

    return sourceItems.filter((item) => {
      const searchable = `${item.name} ${item.tag}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [allMenuItems, menuItems, menuSearch]);

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
      const [ordersResponse, popularMenuResponse, fullMenuResponse, tablesResponse] = await Promise.all([
        fetchWithFallback<BackendOrder[] | { data: BackendOrder[] }>(["/api/pos/orders/active", "/api/orders/active", "/orders/active"]),
        fetchWithFallback<BackendMenuItem[] | { data: BackendMenuItem[] }>(["/api/pos/menu/popular?limit=6", "/api/menu/popular?limit=6", "/menu/popular?limit=6"]),
        fetchWithFallback<BackendMenuItem[] | { data: BackendMenuItem[] }>(["/api/pos/menu", "/api/menu", "/menu"]),
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
        setMenuItems(parsedPopularMenu.map(mapMenuFromBackend).slice(0, 6));
      }

      if (parsedFullMenu.length > 0) {
        setAllMenuItems(parsedFullMenu.map(mapMenuFromBackend));
      }

      if (parsedTables.length > 0) {
        setTables(parsedTables.map(mapTableFromBackend));
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

  const payment = currentOrder?.payment ?? "UPI";
  const mobile = currentOrder?.mobile ?? "";
  const customerName = currentOrder?.customer ?? "";
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

  function handleNewOrderTypeChange(value: OrderType) {
    setNewOrderType(value);
    if (value !== "Dine-In") {
      setNewOrderTableId(null);
      setCandidateTableId(null);
    }
  }

  async function toggleTableStatus(tableId: string) {
    const target = tables.find((table) => table.id === tableId);
    if (!target) {
      return;
    }

    const nextStatus: TableStatus = target.status === "Occupied" ? "Available" : "Occupied";

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
    if (selected.status === "Occupied" && !sameTable) {
      setBanner(`Table ${tableId} is already occupied.`);
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
    if (selected.status === "Occupied" && !sameTable) {
      setBanner(`Table ${tableId} is already occupied.`);
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

    // Persist items to backend
    persistOrderToBackend();
  }

  async function persistOrderToBackend() {
    if (!currentOrder) return;

    try {
      const payload = {
        customer: currentOrder.customer,
        mobile: currentOrder.mobile,
        type: currentOrder.type,
        section: currentOrder.section,
        tableId: currentOrder.tableId,
        payment: currentOrder.payment,
        paymentStatus: currentOrder.paymentStatus,
        preparationStatus: currentOrder.preparationStatus,
        unpaidAmountCleared: currentOrder.unpaidAmountCleared,
        items: currentOrder.items,
      };

      await patchWithFallback(
         [`/api/pos/orders/${encodeURIComponent(currentOrder.id)}`, `/api/orders/${encodeURIComponent(currentOrder.id)}`, `/orders/${encodeURIComponent(currentOrder.id)}`],
        payload,
      );
    } catch (error) {
      console.error("Failed to persist order to backend:", error);
    }
  }

  function updateQty(id: string, delta: number) {
    updateCurrentOrder((order) => ({
      items: order.items
        .map((entry) =>
          entry.id === id ? { ...entry, qty: Math.max(0, entry.qty + delta) } : entry,
        )
        .filter((entry) => entry.qty > 0),
    }));

    // Persist quantity changes to backend
    persistOrderToBackend();
  }

  async function handleSettleAndSave() {
    if (!currentOrder) {
      return;
    }

    const tableId = currentOrder.tableId;

    await patchWithFallback<{ payment: PaymentType }, unknown>(
      [`/api/pos/orders/${encodeURIComponent(currentOrder.id)}/settle`, `/api/orders/${encodeURIComponent(currentOrder.id)}/settle`, `/orders/${encodeURIComponent(currentOrder.id)}/settle`],
      { payment },
    );

    setOrders((prev) =>
      prev.map((order) =>
        order.id === currentOrder.id
          ? { ...order, settled: true, elapsed: "Settled" }
          : order,
      ),
    );

    if (tableId) {
      await patchWithFallback<{ orderId: string }, unknown>(
        [`/api/pos/tables/${tableId}/release`, `/api/tables/${tableId}/release`, `/tables/${tableId}/release`],
        { orderId: currentOrder.id },
      );

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
      tableId: newOrderType === "Dine-In" ? newOrderTableId : null,
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

      if (newOrderType === "Dine-In" && newOrderTableId) {
        await patchWithFallback<{ orderId: string }, { table?: BackendTable }>(
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
        tableId: newOrderType === "Dine-In" ? newOrderTableId : null,
        payment: "UPI",
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
    setNewOrderTableId(null);
    setCandidateTableId(null);
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
              tables={tables}
              newOrderTableId={newOrderTableId}
              isSavingNewOrder={isSavingNewOrder}
              onCustomerChange={setNewOrderCustomer}
              onMobileChange={setNewOrderMobile}
              onTypeChange={handleNewOrderTypeChange}
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

      <div className={`fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${palette.floatingBadge}`}>
        <IndianRupee className="h-3.5 w-3.5" />
        {banner ?? "Synced and live"}
      </div>
    </div>
  );
}
