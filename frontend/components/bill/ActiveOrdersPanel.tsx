"use client";

import { Listbox } from "@headlessui/react";
import { motion } from "framer-motion";
import { ChevronDown, Plus, AlertCircle, CheckCircle2, TableProperties } from "lucide-react";
import type { BillOrder, OrderType, Palette, TableNode } from "./types";
import { getOrderColorStatus, getOrderColorClasses } from "./orderStatusUtils";

type ActiveOrdersPanelProps = {
  isDark: boolean;
  palette: Palette;
  openOrders: BillOrder[];
  currentOrderId: string | undefined;
  money: (value: number) => string;
  newOrderCustomer: string;
  newOrderMobile: string;
  newOrderType: OrderType;
  newOrderFlatNo: string;
  newOrderRoomNo: string;
  newOrderLandmark: string;
  newOrderAutoLocation: string;
  tables: TableNode[];
  newOrderTableId: string | null;
  isSavingNewOrder: boolean;
  onCustomerChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onTypeChange: (value: OrderType) => void;
  onFlatNoChange: (value: string) => void;
  onRoomNoChange: (value: string) => void;
  onLandmarkChange: (value: string) => void;
  onDetectLocation: () => void;
  onNewOrderTableChange: (tableId: string | null) => void;
  onOpenTableView: () => void;
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
  newOrderFlatNo,
  newOrderRoomNo,
  newOrderLandmark,
  newOrderAutoLocation,
  tables,
  newOrderTableId,
  isSavingNewOrder,
  onCustomerChange,
  onMobileChange,
  onTypeChange,
  onFlatNoChange,
  onRoomNoChange,
  onLandmarkChange,
  onDetectLocation,
  onNewOrderTableChange,
  onOpenTableView,
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
            className={`rounded-xl border px-3 py-2 text-sm outline-none text-red-500 placeholder:text-red-300 ${palette.headerPill}`}
          />
          <input
            value={newOrderMobile}
            onChange={(event) => onMobileChange(event.target.value)}
            placeholder="Mobile number"
            className={`rounded-xl border px-3 py-2 text-sm outline-none text-red-500 placeholder:text-red-300 ${palette.headerPill}`}
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
          {newOrderType === "Delivery" ? (
            <>
              <input
                value={newOrderFlatNo}
                onChange={(event) => onFlatNoChange(event.target.value)}
                placeholder="Flat No"
                className={`rounded-xl border px-3 py-2 text-sm outline-none ${palette.headerPill}`}
              />
              <input
                value={newOrderRoomNo}
                onChange={(event) => onRoomNoChange(event.target.value)}
                placeholder="Room No"
                className={`rounded-xl border px-3 py-2 text-sm outline-none ${palette.headerPill}`}
              />
              <input
                value={newOrderLandmark}
                onChange={(event) => onLandmarkChange(event.target.value)}
                placeholder="Nearby landmark"
                className={`rounded-xl border px-3 py-2 text-sm outline-none ${palette.headerPill}`}
              />
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  value={newOrderAutoLocation}
                  readOnly
                  placeholder="Auto location"
                  className={`rounded-xl border px-3 py-2 text-sm outline-none ${palette.headerPill}`}
                />
                <button
                  type="button"
                  onClick={onDetectLocation}
                  className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium ${palette.selectTable}`}
                >
                  Detect
                </button>
              </div>
            </>
          ) : null}
          {newOrderType === "Dine-In" ? (
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Listbox value={newOrderTableId} onChange={onNewOrderTableChange}>
                <div className="relative z-[130]">
                  <Listbox.Button className={palette.dropdownBase ?? `w-full appearance-none rounded-xl border px-3 py-2 pr-9 text-sm outline-none ${palette.headerPill}`}>
                    <span>
                      {newOrderTableId
                        ? (tables.find((table) => table.id === newOrderTableId)?.label ?? newOrderTableId)
                        : "Select table"}
                    </span>
                    <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-slate-300" : "text-slate-500"}`} />
                  </Listbox.Button>
                  <Listbox.Options className={palette.dropdownMenu ?? `absolute z-[160] mt-1 w-full rounded-xl border p-1 text-sm backdrop-blur-xl shadow-[0_18px_40px_rgba(2,6,23,0.35)] ${palette.sectionMenu}`}>
                    <Listbox.Option
                      value={null}
                      className={({ active }) =>
                        `cursor-pointer rounded-lg px-3 py-2 ${active ? (palette.dropdownOptionActive ?? palette.sectionActive) : palette.textMuted}`
                      }
                    >
                      Select table
                    </Listbox.Option>
                    {tables
                      .filter((table) => table.status !== "Occupied" || table.id === newOrderTableId)
                      .map((table) => (
                        <Listbox.Option
                          key={table.id}
                          value={table.id}
                          className={({ active }) =>
                            `cursor-pointer rounded-lg px-3 py-2 ${active ? (palette.dropdownOptionActive ?? palette.sectionActive) : palette.textMuted}`
                          }
                        >
                          {table.label} ({table.status})
                        </Listbox.Option>
                      ))}
                  </Listbox.Options>
                </div>
              </Listbox>
              <button
                type="button"
                onClick={onOpenTableView}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${palette.selectTable}`}
              >
                <TableProperties className="h-4 w-4" />
                Table View
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onCreateOrder}
            disabled={isSavingNewOrder}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {isSavingNewOrder ? "Saving..." : "Save New Order"}
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {openOrders.map((order) => {
          const colorStatus = getOrderColorStatus({
            paymentStatus: order.paymentStatus || "pending",
            preparationStatus: order.preparationStatus || "pending",
            unpaidAmountCleared: order.unpaidAmountCleared,
            settled: order.settled,
          });

          return (
            <motion.article
              key={order.id}
              whileHover={{ y: -2 }}
              className={`cursor-pointer border-2 p-3 shadow-[0_12px_30px_rgba(2,6,23,0.18)] transition ${
                order.id === currentOrderId
                  ? palette.sidebarActive
                  : colorStatus === "yellow"
                  ? isDark
                    ? "border-yellow-500 bg-yellow-900/30"
                    : "border-yellow-500 bg-yellow-100"
                  : colorStatus === "preparing"
                  ? isDark
                    ? "border-blue-500 bg-blue-900/30"
                    : "border-blue-500 bg-blue-100"
                  : isDark
                    ? "rounded-2xl border-slate-600 bg-slate-800"
                    : "rounded-2xl border-slate-300 bg-white"
              } rounded-2xl`}
              onClick={() => onSelectOrder(order.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${palette.textStrong}`}>{order.id}</p>
                  {colorStatus === "yellow" && (
                    <AlertCircle className={`h-4 w-4 ${isDark ? "text-yellow-300" : "text-yellow-700"}`} />
                  )}
                  {colorStatus === "preparing" && (
                    <CheckCircle2 className={`h-4 w-4 ${isDark ? "text-blue-300" : "text-blue-700"}`} />
                  )}
                </div>
                <span className={`rounded-lg px-2 py-0.5 text-xs ${palette.headerPill}`}>{order.elapsed}</span>
              </div>
              <p className={`mt-2 text-sm ${palette.textMuted}`}>{order.customer}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className={palette.highlight}>{order.type}</span>
                <span className={`font-semibold ${palette.textStrong}`}>{money(order.amount)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{order.itemCount} items</p>
              {colorStatus === "yellow" && (
                <p className={`mt-2 text-xs font-semibold ${isDark ? "text-yellow-300" : "text-yellow-800"}`}>Awaiting Payment</p>
              )}
              {colorStatus === "preparing" && (
                <p className={`mt-2 text-xs font-semibold ${isDark ? "text-blue-300" : "text-blue-800"}`}>In Preparation</p>
              )}
            </motion.article>
          );
        })}
        {!openOrders.length ? (
          <div className={`rounded-2xl border p-4 text-sm ${palette.panelSoft}`}>
            All orders are settled. Start a new ticket from the POS flow.
          </div>
        ) : null}
      </div>
    </section>
  );
}
