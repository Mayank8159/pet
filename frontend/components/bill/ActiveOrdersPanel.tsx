"use client";

import { Listbox } from "@headlessui/react";
import { motion } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";
import type { BillOrder, OrderType, Palette } from "./types";

type ActiveOrdersPanelProps = {
  isDark: boolean;
  palette: Palette;
  openOrders: BillOrder[];
  currentOrderId: string | undefined;
  money: (value: number) => string;
  newOrderCustomer: string;
  newOrderMobile: string;
  newOrderType: OrderType;
  isSavingNewOrder: boolean;
  onCustomerChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onTypeChange: (value: OrderType) => void;
  onCreateOrder: () => void;
  onSelectOrder: (orderId: string) => void;
};

export function ActiveOrdersPanel({
  isDark,
  palette,
  openOrders,
  currentOrderId,
  money,
  newOrderCustomer,
  newOrderMobile,
  newOrderType,
  isSavingNewOrder,
  onCustomerChange,
  onMobileChange,
  onTypeChange,
  onCreateOrder,
  onSelectOrder,
}: ActiveOrdersPanelProps) {
  return (
    <section className={`rounded-[28px] p-3.5 backdrop-blur-lg ${palette.panel}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={palette.textStrong}>Active Orders</h2>
        <span className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-[#ff9f8f]" : "text-[#cc4b3e]"}`}>Live</span>
      </div>

      <div className={`mb-3 rounded-2xl border p-3 ${palette.panelSoft}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${palette.textMuted}`}>Add New Order</p>
        <div className="mt-2 grid gap-2">
          <input
            value={newOrderCustomer}
            onChange={(event) => onCustomerChange(event.target.value)}
            placeholder="Customer name"
            className={`rounded-xl border px-3 py-2 text-sm outline-none ${palette.headerPill}`}
          />
          <input
            value={newOrderMobile}
            onChange={(event) => onMobileChange(event.target.value)}
            placeholder="Mobile number"
            className={`rounded-xl border px-3 py-2 text-sm outline-none ${palette.headerPill}`}
          />
          <Listbox value={newOrderType} onChange={onTypeChange}>
            <div className="relative z-[130]">
              <Listbox.Button className={palette.dropdownBase ?? `w-full appearance-none rounded-xl border px-3 py-2 pr-9 text-sm outline-none ${palette.headerPill}`}>
                <span>{newOrderType}</span>
                <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-slate-300" : "text-slate-500"}`} />
              </Listbox.Button>
              <Listbox.Options className={palette.dropdownMenu ?? `absolute z-[160] mt-1 w-full rounded-xl border p-1 text-sm backdrop-blur-xl shadow-[0_18px_40px_rgba(2,6,23,0.35)] ${palette.sectionMenu}`}>
                {(["Dine-In", "Takeaway", "Delivery"] as OrderType[]).map((option) => (
                  <Listbox.Option
                    key={option}
                    value={option}
                    className={({ active }) =>
                      `cursor-pointer rounded-lg px-3 py-2 ${active ? (palette.dropdownOptionActive ?? palette.sectionActive) : palette.textMuted}`
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
            onClick={onCreateOrder}
            disabled={isSavingNewOrder}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              isDark
                ? "bg-[#f06a5a]/20 text-[#ffd8d3] hover:bg-[#f06a5a]/28 disabled:opacity-60"
                : "bg-[#cc4b3e]/12 text-[#7f1d16] hover:bg-[#cc4b3e]/18 disabled:opacity-60"
            }`}
          >
            <Plus className="h-4 w-4" />
            {isSavingNewOrder ? "Saving..." : "Save New Order"}
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {openOrders.map((order) => (
          <motion.article
            key={order.id}
            whileHover={{ y: -2 }}
            className={`cursor-pointer rounded-2xl border p-3 shadow-[0_12px_30px_rgba(2,6,23,0.18)] ${order.id === currentOrderId ? palette.sidebarActive : palette.panelSoft}`}
            onClick={() => onSelectOrder(order.id)}
          >
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${palette.textStrong}`}>{order.id}</p>
              <span className={`rounded-lg px-2 py-0.5 text-xs ${palette.headerPill}`}>{order.elapsed}</span>
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
  );
}
