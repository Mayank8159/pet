"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import type { BillOrder } from "./types";
import {
  getOrderColorStatus,
  getOrderColorClasses,
  getOrderStatusLabel,
  shouldShowUnpaidCheckbox,
} from "./orderStatusUtils";

const POS_API_BASE_URL = process.env.NEXT_PUBLIC_POS_API_BASE_URL ?? "http://localhost:8000";

type BackendOrder = {
  id?: string;
  customer?: string;
  type?: string;
  tableId?: string | null;
  deliveryAddress?: {
    flatNo?: string;
    roomNo?: string;
    landmark?: string;
    autoLocation?: string;
  } | null;
  paymentStatus?: string;
  payment?: string;
  paymentType?: string;
  splitPayment?: {
    cash?: number;
    upi?: number;
  } | null;
  preparationStatus?: string;
  unpaidAmountCleared?: boolean;
  amount?: number;
  itemCount?: number;
  items?: Array<{ name: string; qty: number; price: number }>;
  settled?: boolean;
};

function mapOrderFromBackend(order: BackendOrder, index: number): BillOrder & { paymentStatus: string; preparationStatus: string; unpaidAmountCleared: boolean } {
  const normalizedPayment = order.payment === "Cash" || order.payment === "UPI" || order.payment === "Split"
    ? order.payment
    : "None";

  return {
    id: String(order.id ?? `#${index + 1}`),
    customer: order.customer || "Guest",
    type: order.type === "Delivery" || order.type === "Takeaway" ? order.type : "Dine-In",
    amount: order.amount || 0,
    itemCount: order.itemCount || 0,
    elapsed: "Now",
    mobile: "",
    section: "AC",
    tableId: order.tableId ?? null,
    deliveryAddress: order.deliveryAddress
      ? {
          flatNo: String(order.deliveryAddress.flatNo ?? ""),
          roomNo: String(order.deliveryAddress.roomNo ?? ""),
          landmark: String(order.deliveryAddress.landmark ?? ""),
          autoLocation: String(order.deliveryAddress.autoLocation ?? ""),
        }
      : null,
    payment: normalizedPayment,
    splitPayment: normalizedPayment === "Split"
      ? {
          cash: Number(order.splitPayment?.cash ?? 0),
          upi: Number(order.splitPayment?.upi ?? 0),
        }
      : null,
    items: (order.items || []).map((item, i) => ({
      id: String(i),
      name: item.name,
      qty: item.qty,
      price: item.price,
    })),
    settled: order.settled || false,
    paymentStatus: (order.paymentStatus === "paid" ? "paid" : "pending"),
    preparationStatus: (order.preparationStatus === "prepared" ? "prepared" : "pending"),
    unpaidAmountCleared: order.unpaidAmountCleared || false,
  };
}

type OrderHistoryPanelProps = {
  isDark?: boolean;
  embedded?: boolean;
  orders?: BillOrder[];
  onSelectOrderForBilling?: (orderId: string) => void;
};

type SavedSection = "Dine-In" | "KOT" | "Takeaway";

export function OrderHistoryPanel({
  isDark = false,
  embedded = false,
  orders: providedOrders,
  onSelectOrderForBilling,
}: OrderHistoryPanelProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SavedSection>("Dine-In");

  useEffect(() => {
    if (providedOrders) {
      setLoading(false);
      return () => {};
    }

    async function loadOrders() {
      try {
        const response = await axios.get(`${POS_API_BASE_URL}/api/pos/orders/history`, { timeout: 6000 });
        const data = Array.isArray(response.data) ? response.data : [];
        setOrders(data);
      } catch (error) {
        console.error("Failed to load order history:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [providedOrders]);

  async function toggleUnpaidCleared(orderId: string) {
    try {
      const encodedId = encodeURIComponent(orderId);
      await axios.patch(`${POS_API_BASE_URL}/api/pos/orders/${encodedId}/clear-unpaid`, {}, { timeout: 6000 });
      // Reload orders
      const response = await axios.get(`${POS_API_BASE_URL}/api/pos/orders/history`, { timeout: 6000 });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to toggle unpaid cleared status:", error);
    }
  }

  const displayOrders = useMemo(() => {
    if (providedOrders) {
      return providedOrders.map((order) => ({
        ...order,
        originalOrder: {
          unpaidAmountCleared: order.unpaidAmountCleared,
        },
      }));
    }

    return orders.map((order, idx) => ({
      ...mapOrderFromBackend(order, idx),
      originalOrder: order,
    }));
  }, [orders, providedOrders]);

  const sectionCounts = useMemo(() => {
    return {
      "Dine-In": displayOrders.filter((order) => order.type === "Dine-In" && order.paymentStatus === "paid").length,
      KOT: displayOrders.filter((order) => order.preparationStatus === "prepared" && order.paymentStatus !== "paid").length,
      Takeaway: displayOrders.filter((order) => order.type === "Takeaway" && order.paymentStatus === "paid").length,
    } as Record<SavedSection, number>;
  }, [displayOrders]);

  const filteredOrders = useMemo(() => {
    if (activeSection === "Dine-In") {
      return displayOrders.filter((order) => order.type === "Dine-In" && order.paymentStatus === "paid");
    }

    if (activeSection === "Takeaway") {
      return displayOrders.filter((order) => order.type === "Takeaway" && order.paymentStatus === "paid");
    }

    return displayOrders.filter((order) => order.preparationStatus === "prepared" && order.paymentStatus !== "paid");
  }, [activeSection, displayOrders]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className={embedded ? "space-y-3" : "p-6 space-y-4"}>
      {!embedded ? (
        <Link href="/bill" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Bill
        </Link>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        {(["Dine-In", "KOT", "Takeaway"] as SavedSection[]).map((section) => {
          const isActive = activeSection === section;
          return (
            <button
              key={section}
              type="button"
              onClick={() => {
                setActiveSection(section);
                setExpandedOrderId(null);
              }}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                isActive
                  ? isDark
                    ? "border-[#f06a5a]/35 bg-[#f06a5a]/14 text-[#ffd8d3]"
                    : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"
                  : isDark
                    ? "border-white/10 bg-white/[0.04] text-slate-300"
                    : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {section} ({sectionCounts[section]})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredOrders.map((order) => {
            const compact = embedded;
            const colorStatus = getOrderColorStatus(order);
            const isExpanded = expandedOrderId === order.id;
            const showUnpaidCheckbox = shouldShowUnpaidCheckbox(order);
            const canOpenInBilling = Boolean(onSelectOrderForBilling) && colorStatus === "unpaid-history";
            const lightCardTone =
              colorStatus === "green"
                ? "bg-white border-green-500 shadow-[0_8px_24px_rgba(22,163,74,0.12)]"
                : colorStatus === "unpaid-history"
                  ? "bg-white border-orange-500 shadow-[0_8px_24px_rgba(234,88,12,0.12)]"
                  : colorStatus === "yellow"
                    ? "bg-white border-yellow-500 shadow-[0_8px_24px_rgba(202,138,4,0.12)]"
                    : "bg-white border-blue-500 shadow-[0_8px_24px_rgba(37,99,235,0.12)]";
            const cardTone = isDark
              ? getOrderColorClasses(colorStatus)
              : `rounded-lg border-2 transition-all duration-300 shadow-md hover:shadow-lg ${lightCardTone}`;
            const titleText = isDark ? "text-white" : "text-slate-900";
            const metaText = isDark ? "text-slate-300" : "text-slate-800";
            const mutedText = isDark ? "text-slate-400" : "text-slate-700";
            const amountText = isDark ? "text-slate-200" : "text-slate-900";

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className={`${compact ? "p-2" : "p-4"} ${canOpenInBilling ? (compact ? "pr-10" : "pr-12") : ""} relative overflow-visible cursor-pointer ${cardTone}`}
              >
                {canOpenInBilling ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectOrderForBilling?.(order.id);
                    }}
                    className={`absolute right-2 top-1/2 z-10 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm ${
                      isDark
                        ? "border-rose-300/35 bg-rose-300/10 text-rose-100"
                        : "border-rose-600/30 bg-rose-100 text-rose-800"
                    }`}
                    title="Open in billing panel"
                    aria-label={`Open ${order.id} in billing panel`}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : null}

                <div className={`flex items-start justify-between ${compact ? "gap-2" : "gap-3"}`}>
                  <div className="flex-1">
                    <h3 className={`font-bold ${compact ? "text-xs" : "text-xl"} ${titleText}`}>{order.id}</h3>
                    <p className={`${compact ? "mt-0.5 text-[10px]" : "mt-1 text-xs"} font-medium ${mutedText}`}>Table: {order.tableId ?? "N/A"}</p>

                    {!compact ? (
                      <>
                        <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{order.customer}</p>
                        {order.type === "Delivery" && order.deliveryAddress ? (
                          <p className={`mt-1 text-xs font-medium ${mutedText}`}>
                            {`${order.deliveryAddress.flatNo || ""}${order.deliveryAddress.roomNo ? `, ${order.deliveryAddress.roomNo}` : ""}${order.deliveryAddress.landmark ? `, ${order.deliveryAddress.landmark}` : ""}`.trim() || "Delivery address pending"}
                          </p>
                        ) : null}
                        <div className={`mt-2 text-sm font-semibold ${amountText}`}>₹{order.amount}</div>
                        <p className={`mt-1 text-xs font-medium ${mutedText}`}>
                          Payment: {order.payment === "Split" ? `Split (Cash ₹${order.splitPayment?.cash ?? 0} + UPI ₹${order.splitPayment?.upi ?? 0})` : order.payment}
                        </p>
                      </>
                    ) : null}
                  </div>
                  {!compact ? (
                    <span className="px-3 py-1.5 text-xs rounded-full font-bold whitespace-nowrap shadow-sm bg-slate-400 text-slate-950 dark:bg-slate-600 dark:text-slate-100">
                      {getOrderStatusLabel(colorStatus)}
                    </span>
                  ) : null}
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-3 space-y-2 border-t pt-3 ${isDark ? "border-slate-600" : "border-slate-300"}`}
                    >
                      {/* Order Items */}
                      <div className={`max-h-40 overflow-y-auto rounded border p-3 text-sm shadow-sm ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
                        {order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className={`flex justify-between border-b py-2 last:border-b-0 ${isDark ? "border-slate-700 text-slate-200" : "border-slate-100 text-slate-700"}`}>
                              <span className={`font-medium ${isDark ? "text-slate-100" : "text-slate-900"}`}>{item.qty}x {item.name}</span>
                              <span className={`font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>₹{item.price * item.qty}</span>
                            </div>
                          ))
                        ) : (
                          <p className={`italic ${isDark ? "text-slate-400" : "text-slate-500"}`}>No items</p>
                        )}
                      </div>

                      {/* Unpaid Checkbox - Only show if prepared but not paid */}
                      {showUnpaidCheckbox && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUnpaidCleared(order.id);
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 font-semibold text-sm ${
                            order.originalOrder.unpaidAmountCleared
                              ? "border-green-600 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
                              : "border-orange-600 bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800"
                          }`}
                        >
                          <span>
                            {order.originalOrder.unpaidAmountCleared ? "✓ Cleared" : "⚠️ Unpaid"}: ₹{order.amount}
                          </span>
                          <input
                            type="checkbox"
                            checked={order.originalOrder.unpaidAmountCleared}
                            onChange={() => {}}
                            className="w-5 h-5 cursor-pointer accent-green-600"
                          />
                        </button>
                      )}

                      {/* Status Info */}
                      <div className={`space-y-1 rounded border p-2 text-xs font-medium ${isDark ? "border-slate-600 bg-slate-700 text-slate-300" : "border-slate-200 bg-white text-slate-800"}`}>
                        {order.type === "Delivery" && order.deliveryAddress ? (
                          <p>✓ Location: {order.deliveryAddress.autoLocation || "N/A"}</p>
                        ) : null}
                        <p>✓ Table: {order.tableId ?? "N/A"}</p>
                        <p>✓ Paid: {order.originalOrder.paymentStatus === "paid" ? "Yes" : "No"}</p>
                        <p>✓ Prepared: {order.originalOrder.preparationStatus === "prepared" ? "Yes" : "No"}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!filteredOrders.length ? (
          <div className={`rounded-2xl border p-3 text-sm ${isDark ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
            No {activeSection} saved orders yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
