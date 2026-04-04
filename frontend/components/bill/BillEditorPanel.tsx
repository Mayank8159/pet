"use client";

import { Bike, Calculator, Printer, QrCode, Search, User, Wallet } from "lucide-react";
import type { MenuItem, OrderItem, Palette, PaymentType, SplitPayment } from "./types";

type BillEditorPanelProps = {
  isDark: boolean;
  palette: Palette;
  mobile: string;
  customerName: string;
  menuSearch: string;
  filteredMenuItems: MenuItem[];
  items: OrderItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  payment: PaymentType;
  splitPayment: SplitPayment | null;
  hasCurrentOrder: boolean;
  onMobileChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onMenuSearchChange: (value: string) => void;
  onAddItem: (menuItem: MenuItem) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onPaymentChange: (value: PaymentType) => void;
  onSplitPaymentChange: (value: SplitPayment) => void;
  onSaveAndPrint: () => void;
  onSettleAndSave: () => void;
  money: (value: number) => string;
};

export function BillEditorPanel({
  isDark,
  palette,
  mobile,
  customerName,
  menuSearch,
  filteredMenuItems,
  items,
  subtotal,
  tax,
  grandTotal,
  payment,
  splitPayment,
  hasCurrentOrder,
  onMobileChange,
  onCustomerNameChange,
  onMenuSearchChange,
  onAddItem,
  onUpdateQty,
  onPaymentChange,
  onSplitPaymentChange,
  onSaveAndPrint,
  onSettleAndSave,
  money,
}: BillEditorPanelProps) {
  const splitCash = splitPayment?.cash ?? 0;
  const splitUpi = splitPayment?.upi ?? 0;
  if (!hasCurrentOrder) {
    return (
      <section className={`flex flex-col rounded-[28px] p-3.5 backdrop-blur-lg ${palette.panel}`}>
        <div className={`flex min-h-[420px] items-center justify-center rounded-[24px] border ${palette.panelSoft}`}>
          <div className="max-w-sm space-y-2 text-center">
            <p className={`text-lg font-semibold ${palette.textStrong}`}>No active bill selected</p>
            <p className={`text-sm ${palette.textMuted}`}>
              Create a new order or select an existing active order from the left panel to start billing.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`flex flex-col rounded-[28px] p-3.5 backdrop-blur-lg ${palette.panel}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={`rounded-2xl p-3 backdrop-blur-md ${palette.panelSoft}`}>
          <span className={`mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] ${palette.textMuted}`}>
            <Bike className="h-3.5 w-3.5" />
            Mobile
          </span>
          <input
            value={mobile}
            onChange={(event) => onMobileChange(event.target.value)}
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
            onChange={(event) => onCustomerNameChange(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
            placeholder="Customer name"
          />
        </label>
      </div>

      <div className={`mt-4 rounded-2xl border p-2.5 ${palette.panelSoft}`}>
        <label className="relative block">
          <Search className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${palette.textMuted}`} />
          <input
            value={menuSearch}
            onChange={(event) => onMenuSearchChange(event.target.value)}
            placeholder="Search food by name or tag"
            className={`w-full rounded-xl border py-2 pl-9 pr-3 text-sm outline-none ${palette.headerPill}`}
          />
        </label>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {filteredMenuItems.map((menu) => (
          <button
            key={menu.id}
            type="button"
            onClick={() => onAddItem(menu)}
            className={`rounded-2xl p-3 text-left transition ${palette.gridCard} ${isDark ? "hover:bg-[#f06a5a]/12" : "hover:bg-[#cc4b3e]/8"}`}
          >
            <p className={`text-sm font-medium ${palette.textStrong}`}>{menu.name}</p>
            <p className={`mt-1 text-xs ${palette.textMuted}`}>{menu.tag}</p>
            <p className={`mt-2 text-sm ${palette.highlight}`}>{money(menu.price)}</p>
          </button>
        ))}
        {!filteredMenuItems.length ? (
          <div className={`col-span-full rounded-2xl border p-3 text-sm ${palette.panelSoft} ${palette.textMuted}`}>
            No matching food items found.
          </div>
        ) : null}
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
                onClick={() => onUpdateQty(item.id, -1)}
                className={`rounded-lg border px-2 py-1 text-xs ${palette.headerPill}`}
              >
                -
              </button>
              <span className={`text-sm ${palette.orderText}`}>{item.qty}</span>
              <button
                type="button"
                onClick={() => onUpdateQty(item.id, 1)}
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
            { key: "UPI", icon: QrCode },
            { key: "Split", icon: Wallet },
          ] as { key: PaymentType; icon: React.ComponentType<{ className?: string }> }[]).map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onPaymentChange(option.key)}
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

        {payment === "Split" ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className={`rounded-2xl border px-3 py-2 text-sm ${palette.headerPill}`}>
              <span className={`mb-1 block text-xs uppercase tracking-[0.14em] ${palette.textMuted}`}>Cash amount</span>
              <input
                type="number"
                min={0}
                step="1"
                value={splitCash}
                onChange={(event) =>
                  onSplitPaymentChange({
                    cash: Number(event.target.value || 0),
                    upi: splitUpi,
                  })
                }
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
              />
            </label>
            <label className={`rounded-2xl border px-3 py-2 text-sm ${palette.headerPill}`}>
              <span className={`mb-1 block text-xs uppercase tracking-[0.14em] ${palette.textMuted}`}>UPI amount</span>
              <input
                type="number"
                min={0}
                step="1"
                value={splitUpi}
                onChange={(event) =>
                  onSplitPaymentChange({
                    cash: splitCash,
                    upi: Number(event.target.value || 0),
                  })
                }
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
              />
            </label>
            <p className={`sm:col-span-2 text-xs ${palette.textMuted}`}>
              Split total: {money(splitCash + splitUpi)} | Bill total: {money(grandTotal)}
            </p>
          </div>
        ) : null}

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onSaveAndPrint}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-[#f06a5a]/35 bg-[#f06a5a]/18 text-[#ffd8d3]" : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"}`}
          >
            <Printer className="h-4 w-4" />
            Save & Print
          </button>
          <button
            type="button"
            onClick={onSettleAndSave}
            disabled={!hasCurrentOrder || items.length === 0}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-[#6be7cf]/25 bg-[#6be7cf]/12 text-[#d8fff7]" : "border-[#2f9e88]/20 bg-[#2f9e88]/10 text-[#14564a]"}`}
          >
            <Calculator className="h-4 w-4" />
            Settle & Save
          </button>
        </div>
      </div>
    </section>
  );
}
