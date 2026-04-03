"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, DollarSign } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import type { BillOrder } from "./types";
import {
  getOrderColorStatus,
  getOrderColorClasses,
  getOrderStatusLabel,
  shouldShowInLiveView,
  shouldShowUnpaidCheckbox,
} from "./orderStatusUtils";

const POS_API_BASE_URL = process.env.NEXT_PUBLIC_POS_API_BASE_URL ?? "http://localhost:8000";

type BackendOrder = {
  id?: string;
  customer?: string;
  type?: string;
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
  createdAt?: string;
  settled?: boolean;
};

function mapOrderFromBackend(order: BackendOrder, index: number): BillOrder & { paymentStatus: string; preparationStatus: string; unpaidAmountCleared: boolean; createdAt: string } {
  return {
    id: String(order.id ?? `#${index + 1}`),
    customer: order.customer || "Guest",
    type: order.type === "Delivery" || order.type === "Takeaway" ? order.type : "Dine-In",
    amount: order.amount || 0,
    itemCount: order.itemCount || 0,
    elapsed: "Now",
    mobile: "",
    section: "AC",
    tableId: null,
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
    createdAt: order.createdAt || new Date().toISOString(),
  };
}

export function LiveViewPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Load orders on mount and set up polling
  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await axios.get(`${POS_API_BASE_URL}/api/pos/orders/live`, { timeout: 6000 });
        const data = Array.isArray(response.data) ? response.data : [];
        setOrders(data);
        
        // Initialize timers for each order
        const newTimers: Record<string, number> = {};
        data.forEach((order: any) => {
          if (order.createdAt) {
            const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
            newTimers[order.id] = elapsed;
          }
        });
        setTimers(newTimers);
      } catch (error) {
        console.error("Failed to load live orders:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
    const interval = setInterval(loadOrders, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key] += 1;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function togglePrepared(orderId: string) {
    try {
      const encodedId = encodeURIComponent(orderId);
      await axios.patch(`${POS_API_BASE_URL}/api/pos/orders/${encodedId}/prepared`, {}, { timeout: 6000 });
      // Reload orders
      const response = await axios.get(`${POS_API_BASE_URL}/api/pos/orders/live`, { timeout: 6000 });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to toggle prepared status:", error);
    }
  }

  async function togglePaid(orderId: string) {
    try {
      const encodedId = encodeURIComponent(orderId);
      await axios.patch(`${POS_API_BASE_URL}/api/pos/orders/${encodedId}/paid`, {}, { timeout: 6000 });
      // Reload orders
      const response = await axios.get(`${POS_API_BASE_URL}/api/pos/orders/live`, { timeout: 6000 });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to toggle paid status:", error);
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
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">No orders in preparation</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayOrders.map((order) => {
          const colorStatus = getOrderColorStatus(order);
          const timer = timers[order.id] ?? 0;
          const minutes = Math.floor(timer / 60);
          const seconds = timer % 60;

          return (
            <motion.div
              key={order.id}
              layout
              className={`p-4 ${getOrderColorClasses(colorStatus)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white">{order.id}</h3>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">{order.customer}</p>
                  {order.type === "Delivery" && order.deliveryAddress ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {`${order.deliveryAddress.flatNo || ""}${order.deliveryAddress.roomNo ? `, ${order.deliveryAddress.roomNo}` : ""}${order.deliveryAddress.landmark ? `, ${order.deliveryAddress.landmark}` : ""}`.trim() || "Delivery address pending"}
                    </p>
                  ) : null}
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${
                  colorStatus === "yellow" ? "bg-yellow-400 text-yellow-950 dark:bg-yellow-700 dark:text-yellow-100" :
                  colorStatus === "preparing" ? "bg-blue-400 text-blue-950 dark:bg-blue-700 dark:text-blue-100" :
                  colorStatus === "green" ? "bg-green-400 text-green-950 dark:bg-green-700 dark:text-green-100" :
                  "bg-orange-400 text-orange-950 dark:bg-orange-700 dark:text-orange-100"
                }`}>
                  {getOrderStatusLabel(colorStatus)}
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
              </div>

              {/* Order Items */}
              <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-3 mb-3 text-sm max-h-28 overflow-y-auto shadow-sm">
                {order.items.length > 0 ? order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1.5 text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{item.qty}x {item.name}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">₹{item.price * item.qty}</span>
                  </div>
                )) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">No items</p>
                )}
              </div>

              {/* Amount */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded p-3 mb-3 border border-slate-200 dark:border-slate-600 border-l-4 border-l-slate-400 dark:border-l-slate-500">
                <p className="text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{order.amount}</p>
              </div>

              {/* Status Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => togglePrepared(order.id)}
                  className={`px-3 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-md ${
                    order.originalOrder.preparationStatus === "prepared"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                  }`}
                  title="Mark as completed and move to order history"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {order.originalOrder.preparationStatus === "prepared" ? "✓ Done" : "Complete"}
                </button>
                <button
                  onClick={() => togglePaid(order.id)}
                  className={`px-3 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-md ${
                    order.originalOrder.paymentStatus === "paid"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                  }`}
                  title="Mark payment as received"
                >
                  <DollarSign className="w-4 h-4" />
                  {order.originalOrder.paymentStatus === "paid" ? "✓ Paid" : "Collect"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
