"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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
  preparationStatus?: string;
  unpaidAmountCleared?: boolean;
  amount?: number;
  itemCount?: number;
  items?: Array<{ name: string; qty: number; price: number }>;
  settled?: boolean;
};

function mapOrderFromBackend(order: BackendOrder, index: number): BillOrder & { paymentStatus: string; preparationStatus: string; unpaidAmountCleared: boolean } {
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
    payment: "UPI",
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

export function OrderHistoryPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

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
    return orders.map((order, idx) => ({
      ...mapOrderFromBackend(order, idx),
      originalOrder: order,
    }));
  }, [orders]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (displayOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No order history yet</p>
        <Link href="/bill" className="text-blue-600 hover:underline">
          ← Back to Bill
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <Link href="/bill" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Bill
      </Link>

      <div className="space-y-3">
        <AnimatePresence>
          {displayOrders.map((order) => {
            const colorStatus = getOrderColorStatus(order);
            const isExpanded = expandedOrderId === order.id;
            const showUnpaidCheckbox = shouldShowUnpaidCheckbox(order);

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className={`p-4 cursor-pointer ${getOrderColorClasses(colorStatus)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{order.id}</h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">{order.customer}</p>
                    {order.type === "Delivery" && order.deliveryAddress ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {`${order.deliveryAddress.flatNo || ""}${order.deliveryAddress.roomNo ? `, ${order.deliveryAddress.roomNo}` : ""}${order.deliveryAddress.landmark ? `, ${order.deliveryAddress.landmark}` : ""}`.trim() || "Delivery address pending"}
                      </p>
                    ) : null}
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Table: {order.tableId ?? "N/A"}</p>
                    <div className="text-sm font-semibold mt-2 text-slate-700 dark:text-slate-200">₹{order.amount}</div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${
                    colorStatus === "green" ? "bg-green-400 text-green-950 dark:bg-green-700 dark:text-green-100" :
                    colorStatus === "unpaid-history" ? "bg-orange-400 text-orange-950 dark:bg-orange-700 dark:text-orange-100" :
                    "bg-slate-400 text-slate-950 dark:bg-slate-600 dark:text-slate-100"
                  }`}>
                    {getOrderStatusLabel(colorStatus)}
                  </span>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600 space-y-2"
                    >
                      {/* Order Items */}
                      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-3 text-sm max-h-40 overflow-y-auto shadow-sm">
                        {order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between py-2 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                              <span className="font-medium text-slate-800 dark:text-slate-100">{item.qty}x {item.name}</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-50">₹{item.price * item.qty}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 italic">No items</p>
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
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300 space-y-1 bg-slate-50 dark:bg-slate-700 rounded p-2 border border-slate-200 dark:border-slate-600">
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
      </div>
    </div>
  );
}
