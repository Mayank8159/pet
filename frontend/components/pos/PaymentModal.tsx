"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Banknote, QrCode, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { PaymentMethod } from "./types";

interface PaymentModalProps {
  open: boolean;
  total: number;
  onClose: () => void;
  onComplete: (method: PaymentMethod) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PaymentModal({ open, total, onClose, onComplete }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("UPI");

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 30, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 20, scale: 0.96, opacity: 0 }}
            className="w-full max-w-4xl overflow-hidden rounded-[34px] border border-white/14 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(10,17,31,0.92))] text-white shadow-[0_35px_120px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-cyan-100/70">Checkout</p>
                <h3 className="mt-2 text-3xl font-semibold">Finalize payment</h3>
                <p className="mt-1 text-sm text-slate-300">Choose a graphical payment method and close the ticket.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/6 p-2 text-white/80 transition hover:bg-white/12"
                aria-label="Close payment modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 p-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[30px] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.34em] text-slate-300">Payment methods</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <motion.button
                    type="button"
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMethod("UPI")}
                    className={`rounded-[28px] border p-5 text-left transition ${
                      selectedMethod === "UPI"
                        ? "border-cyan-300/60 bg-cyan-300/14 shadow-[0_20px_50px_rgba(34,211,238,0.18)]"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-2xl font-semibold">UPI</p>
                        <p className="mt-1 text-sm text-slate-300">Scan and pay instantly.</p>
                      </div>
                      <QrCode className="h-8 w-8 text-cyan-200" />
                    </div>
                    <div className="mt-5 grid place-items-center rounded-[22px] bg-white p-4 text-slate-900">
                      <div className="grid h-32 w-32 grid-cols-8 gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-2">
                        {Array.from({ length: 64 }).map((_, index) => (
                          <span
                            key={`qr-${index}`}
                            className={`rounded-[3px] ${index % 3 === 0 || index % 7 === 0 ? "bg-slate-900" : "bg-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMethod("Cash")}
                    className={`rounded-[28px] border p-5 text-left transition ${
                      selectedMethod === "Cash"
                        ? "border-emerald-300/60 bg-emerald-300/14 shadow-[0_20px_50px_rgba(52,211,153,0.18)]"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-2xl font-semibold">Cash</p>
                        <p className="mt-1 text-sm text-slate-300">Mark payment at the counter.</p>
                      </div>
                      <Banknote className="h-8 w-8 text-emerald-200" />
                    </div>
                    <div className="mt-5 rounded-[22px] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
                      <div className="flex items-center gap-2 text-emerald-200">
                        <Sparkles className="h-4 w-4" />
                        Fast counter settlement
                      </div>
                      <p className="mt-3 leading-6 text-emerald-50/90">
                        Hand over the bill, receive the amount, and close the ticket with a single tap.
                      </p>
                    </div>
                  </motion.button>
                </div>
              </div>

              <div className="rounded-[30px] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.34em] text-slate-300">Ticket summary</p>
                <div className="mt-4 rounded-[28px] border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Amount due</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="mt-4 h-px bg-white/10" />
                  <div className="mt-4 space-y-3 text-sm text-slate-200">
                    <p className="flex items-center justify-between">
                      <span>Method</span>
                      <span className="font-medium text-white">{selectedMethod}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Status</span>
                      <span className="font-medium text-cyan-200">Ready</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Settlement</span>
                      <span className="font-medium text-white">Immediate</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onComplete(selectedMethod)}
                  className="mt-5 w-full rounded-[22px] bg-white px-5 py-4 text-lg font-semibold text-slate-950 shadow-[0_18px_40px_rgba(255,255,255,0.16)] transition hover:bg-cyan-100"
                >
                  Complete payment
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}