"use client";

import { motion } from "framer-motion";
import { Banknote, Printer, ShieldCheck, Sparkles } from "lucide-react";
import type { BillItem, OrderType, ReceiptData, TableNode } from "./types";
import { Receipt as ReceiptSheet } from "./Receipt";

interface BillSidebarProps {
  orderType: OrderType;
  activeTable: TableNode | null;
  items: BillItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  receipt: ReceiptData | null;
  onRemoveItem: (itemId: string) => void;
  onOpenPayment: () => void;
  onPrintReceipt: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BillSidebar({
  orderType,
  activeTable,
  items,
  subtotal,
  tax,
  serviceCharge,
  total,
  receipt,
  onRemoveItem,
  onOpenPayment,
  onPrintReceipt,
}: BillSidebarProps) {
  const currentTicket = receipt ?? null;

  return (
    <div className="flex h-full flex-col gap-4 bg-white/8 p-4 backdrop-blur-md lg:p-5">
      <div className="rounded-[30px] border border-white/12 bg-[linear-gradient(135deg,rgba(103,232,249,0.16),rgba(255,255,255,0.04))] p-5 shadow-[0_30px_100px_rgba(8,15,29,0.25)]">
        <p className="text-xs uppercase tracking-[0.34em] text-cyan-100/70">Live bill</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Checkout panel</h2>
        <div className="mt-5 grid gap-3 text-sm text-slate-200">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
            <span>Mode</span>
            <span className="font-medium text-white">{orderType}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
            <span>Table</span>
            <span className="font-medium text-white">{activeTable?.name ?? "No table"}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
            <span>Items</span>
            <span className="font-medium text-white">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
        </div>
      </div>

      {currentTicket ? (
        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="rounded-[30px] border border-white/12 bg-white/6 p-3 shadow-[0_24px_70px_rgba(8,15,29,0.24)]">
            <ReceiptSheet receipt={currentTicket} className="bg-white" />
          </div>
          <div className="grid gap-3">
            <button
              type="button"
              onClick={onPrintReceipt}
              className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-white px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              <Printer className="h-5 w-5" />
              Print receipt
            </button>
            <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
              <ShieldCheck className="mb-2 h-5 w-5 text-emerald-200" />
              Ticket closed and archived for print.
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="rounded-[30px] border border-white/12 bg-white/6 p-5 shadow-[0_24px_70px_rgba(8,15,29,0.24)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-slate-300">Current basket</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{items.length ? "Items on ticket" : "No items added"}</h3>
              </div>
              <Sparkles className="h-6 w-6 text-cyan-200" />
            </div>

            <div className="mt-4 space-y-3">
              {items.length ? (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[22px] border border-white/10 bg-slate-950/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <p className="text-right text-sm font-semibold text-white">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="mt-3 text-xs uppercase tracking-[0.3em] text-rose-200 transition hover:text-rose-100"
                    >
                      Remove
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/12 bg-white/5 px-4 py-8 text-center text-sm text-slate-300">
                  Add dishes from the gallery to start a live bill.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/12 bg-white/6 p-5 shadow-[0_24px_70px_rgba(8,15,29,0.24)]">
            <div className="space-y-2 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Service charge</span>
                <span>{formatCurrency(serviceCharge)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 text-lg font-semibold text-white">
              <span>Total due</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <button
              type="button"
              disabled={!items.length}
              onClick={onOpenPayment}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-white px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Banknote className="h-5 w-5" />
              Proceed to payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}