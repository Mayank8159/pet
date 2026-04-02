"use client";

import { Dialog, Listbox } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bike,
  Calculator,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FileText,
  Home as HomeIcon,
  IndianRupee,
  LayoutGrid,
  PieChart,
  Printer,
  QrCode,
  Settings,
  ShoppingBag,
  Sparkles,
  TableProperties,
  Truck,
  User,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type OrderType = "Delivery" | "Takeaway" | "Dine-In";
type SectionType = "AC" | "Non-AC" | "Rooftop";
type PaymentType = "Cash" | "Card" | "UPI";
type TableStatus = "Available" | "Occupied";

type TableNode = {
  id: string;
  label: string;
  status: TableStatus;
  top: string;
  left: string;
};

type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

type ActiveOrder = {
  id: string;
  customer: string;
  type: OrderType;
  amount: number;
  itemCount: number;
  elapsed: string;
};

type BillOrder = ActiveOrder & {
  mobile: string;
  section: SectionType;
  tableId: string | null;
  payment: PaymentType;
  items: OrderItem[];
  settled: boolean;
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  tag: string;
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

const tableNodes: TableNode[] = [
  { id: "T1", label: "T1", status: "Occupied", top: "10%", left: "10%" },
  { id: "T2", label: "T2", status: "Available", top: "12%", left: "36%" },
  { id: "T3", label: "T3", status: "Available", top: "11%", left: "68%" },
  { id: "T4", label: "T4", status: "Occupied", top: "42%", left: "16%" },
  { id: "T5", label: "T5", status: "Available", top: "42%", left: "44%" },
  { id: "T6", label: "T6", status: "Occupied", top: "42%", left: "72%" },
  { id: "T7", label: "T7", status: "Available", top: "74%", left: "24%" },
  { id: "T8", label: "T8", status: "Available", top: "74%", left: "56%" },
];

const orderTypeMeta: Record<OrderType, { icon: React.ComponentType<{ className?: string }> }> = {
  Delivery: { icon: Truck },
  Takeaway: { icon: ShoppingBag },
  "Dine-In": { icon: HomeIcon },
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const pathname = usePathname();
  const [orders, setOrders] = useState<BillOrder[]>(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrders[0].id);
  const [showTableModal, setShowTableModal] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const openOrders = useMemo(() => orders.filter((order) => !order.settled), [orders]);

  useEffect(() => {
    if (!banner) {
      return;
    }

    const timeout = window.setTimeout(() => setBanner(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [banner]);

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
    ? tableNodes.find((table) => table.id === currentOrder.tableId) ?? null
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

  const isDark = false;

  const palette = {
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

    setOrders((prev) =>
      prev.map((order) =>
        order.id === currentOrder.id
          ? { ...order, settled: true, elapsed: "Settled" }
          : order,
      ),
    );
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

  return (
    <div className={`min-h-screen ${palette.shell}`}>
      <div className={`fixed inset-0 -z-10 ${palette.backdrop}`} />

      <div className="flex min-h-screen">
        <aside className={`hidden w-24 flex-col p-3 backdrop-blur-xl lg:flex ${palette.sidebar}`}>
          <div className={`mb-4 rounded-2xl border p-3 text-center shadow-[0_12px_30px_rgba(0,0,0,0.2)] ${isDark ? "border-white/8 bg-white/[0.06]" : "border-black/5 bg-white"}`}>
            <p className={`text-xs font-semibold tracking-[0.2em] ${palette.sidebarBrand}`}>POSS</p>
          </div>

          <nav className="space-y-2 text-xs">
            {[
              { label: "Billing", icon: FileText, href: "/bill" },
              { label: "Operations", icon: ClipboardList, href: "/bill/operations" },
              { label: "Reports", icon: BarChart3, href: "/bill/reports" },
              { label: "Live View", icon: PieChart, href: "/bill/live-view" },
              { label: "Settings", icon: Settings, href: "/bill/settings" },
            ].map((entry) => {
              const isActive = pathname === entry.href;

              return (
                <Link
                  key={entry.label}
                  href={entry.href}
                  className={`flex w-full flex-col items-center gap-1 rounded-xl border p-2.5 transition ${
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
          <header className={`border-b px-4 py-3.5 backdrop-blur-md md:px-6 ${palette.header}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.22em] ${isDark ? "text-[#ff9f8f]/80" : "text-[#cc4b3e]/80"}`}>Restaurant POS</p>
                <h1 className={`text-2xl font-semibold md:text-3xl ${palette.textStrong}`}>Live Billing Desk</h1>
              </div>
              <div className={`rounded-2xl px-4 py-2 text-sm ${palette.headerPill}`}>
                {currentOrder ? `Order ${currentOrder.id}` : "No active orders"}
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
                      <div className="relative">
                        <Listbox.Button className={`inline-flex min-w-32 items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm backdrop-blur-md ${palette.sectionButton}`}>
                          <span>Section: {section}</span>
                          <ChevronDown className="h-4 w-4 text-slate-300" />
                        </Listbox.Button>
                        <Listbox.Options className={`absolute z-20 mt-1 w-full rounded-xl p-1 text-sm backdrop-blur-xl ${palette.sectionMenu}`}>
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

          <div className="grid flex-1 gap-4 p-4 md:grid-cols-[0.82fr_1.18fr] md:p-5">
            <section className={`rounded-[28px] p-3.5 backdrop-blur-lg ${palette.panel}`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className={palette.textStrong}>Active Orders</h2>
                <span className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-[#ff9f8f]" : "text-[#cc4b3e]"}`}>Live</span>
              </div>

              <div className="space-y-2.5">
                {openOrders.map((order) => (
                  <motion.article
                    key={order.id}
                    whileHover={{ y: -2 }}
                    className={`cursor-pointer rounded-2xl border p-3 shadow-[0_12px_30px_rgba(2,6,23,0.18)] ${order.id === selectedOrderId ? palette.sidebarActive : palette.panelSoft}`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${palette.textStrong}`}>{order.id}</p>
                      <span className={`rounded-lg px-2 py-0.5 text-xs ${palette.headerPill}`}>
                        {order.elapsed}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${palette.textMuted}`}>{order.customer}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className={palette.highlight}>{order.type}</span>
                      <span className={`font-semibold ${palette.textStrong}`}>{money(order.amount)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{order.itemCount} items</p>
                  </motion.article>
                ))}
                {!openOrders.length ? (
                  <div className={`rounded-2xl border p-4 text-sm ${palette.panelSoft}`}>
                    All orders are settled. Start a new ticket from the POS flow.
                  </div>
                ) : null}
              </div>
            </section>

            <section className={`flex flex-col rounded-[28px] p-3.5 backdrop-blur-lg ${palette.panel}`}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`rounded-2xl p-3 backdrop-blur-md ${palette.panelSoft}`}>
                  <span className={`mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] ${palette.textMuted}`}>
                    <Bike className="h-3.5 w-3.5" />
                    Mobile
                  </span>
                  <input
                    value={mobile}
                    onChange={(event) => updateCurrentOrder({ mobile: event.target.value })}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                    placeholder="Enter mobile"
                  />
                </label>

                <label className={`rounded-2xl p-3 backdrop-blur-md ${palette.panelSoft}`}>
                  <span className={`mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] ${palette.textMuted}`}>
                    <User className="h-3.5 w-3.5" />
                    Name
                  </span>
                  <input
                    value={customerName}
                    onChange={(event) => updateCurrentOrder({ customer: event.target.value })}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
                    placeholder="Customer name"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {quickMenu.map((menu) => (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => addItem(menu)}
                    className={`rounded-2xl p-3 text-left transition ${palette.gridCard} ${isDark ? "hover:bg-[#f06a5a]/12" : "hover:bg-[#cc4b3e]/8"}`}
                  >
                    <p className={`text-sm font-medium ${palette.textStrong}`}>{menu.name}</p>
                    <p className={`mt-1 text-xs ${palette.textMuted}`}>{menu.tag}</p>
                    <p className={`mt-2 text-sm ${palette.highlight}`}>{money(menu.price)}</p>
                  </button>
                ))}
              </div>

              <div className={`mt-4 flex-1 overflow-auto rounded-2xl p-3 ${palette.tableGrid}`}>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-[1.2fr_auto_auto_auto] items-center gap-2 rounded-xl px-3 py-2 ${palette.gridCard}`}
                    >
                      <p className={`text-sm ${palette.textStrong}`}>{item.name}</p>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className={`rounded-lg border px-2 py-1 text-xs ${palette.headerPill}`}
                      >
                        -
                      </button>
                      <span className={`text-sm ${palette.orderText}`}>{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className={`rounded-lg border px-2 py-1 text-xs ${palette.headerPill}`}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`mt-4 rounded-2xl p-3 ${palette.totals}`}>
                <div className={`flex items-center justify-between text-sm ${palette.textMuted}`}>
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className={`mt-1 flex items-center justify-between text-sm ${palette.textMuted}`}>
                  <span>Tax</span>
                  <span>{money(tax)}</span>
                </div>
                <div className={`mt-2 flex items-center justify-between border-t pt-2 text-base font-semibold ${palette.textStrong} ${isDark ? "border-white/10" : "border-black/5"}`}>
                  <span>Grand Total</span>
                  <span>{money(grandTotal)}</span>
                </div>
              </div>

              <div className={`mt-4 rounded-3xl p-3 backdrop-blur-lg ${palette.paymentPanel}`}>
                <div className="grid gap-2 sm:grid-cols-3">
                  {([
                    { key: "Cash", icon: Wallet },
                    { key: "Card", icon: CreditCard },
                    { key: "UPI", icon: QrCode },
                  ] as { key: PaymentType; icon: React.ComponentType<{ className?: string }> }[]).map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => updateCurrentOrder({ payment: option.key })}
                      className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                        payment === option.key
                          ? isDark
                            ? "border-[#f06a5a]/35 bg-[#f06a5a]/15 text-[#ffd8d3]"
                            : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"
                          : palette.headerPill
                      }`}
                    >
                      <option.icon className="h-5 w-5" />
                      {option.key}
                    </button>
                  ))}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleSaveAndPrint}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-[#f06a5a]/35 bg-[#f06a5a]/18 text-[#ffd8d3]" : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"}`}
                  >
                    <Printer className="h-4 w-4" />
                    Save & Print
                  </button>
                  <button
                    type="button"
                    onClick={handleSettleAndSave}
                    disabled={!currentOrder || items.length === 0}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-[#6be7cf]/25 bg-[#6be7cf]/12 text-[#d8fff7]" : "border-[#2f9e88]/20 bg-[#2f9e88]/10 text-[#14564a]"}`}
                  >
                    <Calculator className="h-4 w-4" />
                    Settle & Save
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTableModal ? (
          <Dialog open={showTableModal} onClose={setShowTableModal} className="relative z-50">
              <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 backdrop-blur-sm ${palette.modalOverlay}`}
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                className={`w-full max-w-2xl rounded-3xl p-5 backdrop-blur-xl ${palette.modal}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <Dialog.Title className={`inline-flex items-center gap-2 text-xl font-semibold ${palette.textStrong}`}>
                    <LayoutGrid className={`h-5 w-5 ${isDark ? "text-[#ff9f8f]" : "text-[#cc4b3e]"}`} />
                    Select Table From Floor Map
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={() => setShowTableModal(false)}
                    className={`rounded-xl border p-2 ${palette.headerPill}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className={`relative h-[320px] rounded-2xl border ${palette.modalGrid}`}>
                  <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:52px_52px]" />

                  {tableNodes.map((table) => {
                    const isSelected = selectedTable?.id === table.id;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => updateCurrentOrder({ tableId: table.id })}
                        style={{ top: table.top, left: table.left }}
                        className={`absolute grid h-16 w-16 place-items-center rounded-xl border text-sm font-semibold transition ${
                          table.status === "Available"
                            ? isDark
                              ? "border-emerald-300/35 bg-emerald-300/18 text-emerald-100"
                              : "border-emerald-300/25 bg-emerald-300/12 text-emerald-800"
                            : isDark
                              ? "border-rose-300/35 bg-rose-300/18 text-rose-100"
                              : "border-rose-300/25 bg-rose-300/12 text-rose-800"
                        } ${isSelected ? `ring-2 ${isDark ? "ring-[#ff9f8f]" : "ring-[#cc4b3e]"}` : ""}`}
                      >
                        {table.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className={`inline-flex items-center gap-2 text-sm ${palette.textMuted}`}>
                    <span className="inline-block h-3 w-3 rounded-full bg-emerald-300" />
                    Available
                    <span className="ml-3 inline-block h-3 w-3 rounded-full bg-rose-300" />
                    Occupied
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTableModal(false)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${isDark ? "border-[#f06a5a]/30 bg-[#f06a5a]/15 text-[#ffd8d3]" : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"}`}
                  >
                    <Sparkles className="h-4 w-4" />
                    Confirm {selectedTable?.label ?? "table"}
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        ) : null}
      </AnimatePresence>

      <div className={`fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${palette.floatingBadge}`}>
        <IndianRupee className="h-3.5 w-3.5" />
        {banner ?? "Synced and live"}
      </div>
    </div>
  );
}
