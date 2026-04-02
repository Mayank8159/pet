"use client";

import type { ReceiptData } from "./types";

interface ReceiptProps {
  receipt: ReceiptData;
  className?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function Receipt({ receipt, className = "" }: ReceiptProps) {
  return (
    <section
      className={`rounded-[28px] border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.18)] ${className}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-dashed border-slate-300 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Restaurant receipt</p>
          <h3 className="mt-2 text-2xl font-semibold">Order {receipt.orderId}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {receipt.tableLabel} · {receipt.orderType} · {receipt.paymentMethod}
          </p>
        </div>
        <div className="text-right text-sm text-slate-500">
          <p>{receipt.issuedAt}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {receipt.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
            <div>
              <p className="font-medium text-slate-900">{item.name}</p>
              <p className="text-slate-500">
                {item.quantity} x {formatCurrency(item.price)}
              </p>
            </div>
            <p className="font-medium text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-2 rounded-[22px] bg-slate-50 p-4 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(receipt.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Tax</span>
          <span>{formatCurrency(receipt.tax)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Service charge</span>
          <span>{formatCurrency(receipt.serviceCharge)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-950">
          <span>Total</span>
          <span>{formatCurrency(receipt.total)}</span>
        </div>
      </div>
    </section>
  );
}