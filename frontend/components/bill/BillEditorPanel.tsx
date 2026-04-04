"use client";

import { Bike, Calculator, Printer, QrCode, Search, User, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import type { MenuItem, OrderItem, OrderType, Palette, PaymentType, SectionType, SplitPayment } from "./types";

type BillEditorPanelProps = {
  isDark: boolean;
  palette: Palette;
  orderType: OrderType;
  section: SectionType;
  tableId: string | null;
  persons: number;
  mobile: string;
  customerName: string;
  menuSearch: string;
  filteredMenuItems: MenuItem[];
  menuSettingsItems: MenuItem[];
  menuAvailability: Record<string, boolean>;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  payment: PaymentType;
  splitPayment: SplitPayment | null;
  hasCurrentOrder: boolean;
  onMobileChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onOrderTypeChange: (value: OrderType) => void;
  onSectionChange: (value: SectionType) => void;
  onPersonsChange: (value: number) => void;
  onOpenTableView: () => void;
  onMenuSearchChange: (value: string) => void;
  onMenuAvailabilityChange: (menuItemId: string, nextAvailability: boolean) => void;
  onAddItem: (menuItem: MenuItem) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onPaymentChange: (value: PaymentType) => void;
  onSplitPaymentChange: (value: SplitPayment) => void;
  onSaveAndPrint: () => void;
  onSaveAndEbill: () => void;
  onSettleAndSave: () => void;
  onKOT: () => void;
  onKOTPrint: () => void;
  isSavingAndPrinting: boolean;
  isSavingAndEbill: boolean;
  isSettlingAndSaving: boolean;
  isCreatingKOT: boolean;
  isCreatingKOTPrint: boolean;
  money: (value: number) => string;
};

export function BillEditorPanel({
  isDark,
  palette,
  orderType,
  section,
  tableId,
  persons,
  mobile,
  customerName,
  menuSearch,
  filteredMenuItems,
  menuSettingsItems,
  menuAvailability,
  items,
  subtotal,
  tax,
  grandTotal,
  payment,
  splitPayment,
  hasCurrentOrder,
  onMobileChange,
  onCustomerNameChange,
  onOrderTypeChange,
  onSectionChange,
  onPersonsChange,
  onOpenTableView,
  onMenuSearchChange,
  onMenuAvailabilityChange,
  onAddItem,
  onUpdateQty,
  onPaymentChange,
  onSplitPaymentChange,
  onSaveAndPrint,
  onSaveAndEbill,
  onSettleAndSave,
  onKOT,
  onKOTPrint,
  isSavingAndPrinting,
  isSavingAndEbill,
  isSettlingAndSaving,
  isCreatingKOT,
  isCreatingKOTPrint,
  money,
}: BillEditorPanelProps) {
  const splitCash = splitPayment?.cash ?? 0;
  const splitUpi = splitPayment?.upi ?? 0;
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [containerCharge, setContainerCharge] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [tip, setTip] = useState(0);
  const [customerPaid, setCustomerPaid] = useState(0);

  const adjustedTotal = useMemo(
    () => Math.max(0, grandTotal - discount + deliveryCharge + containerCharge + roundOff + tip),
    [grandTotal, discount, deliveryCharge, containerCharge, roundOff, tip],
  );
  const returnToCustomer = customerPaid - adjustedTotal;

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
      <div className={`grid gap-2 rounded-2xl border p-3 ${palette.panelSoft} sm:grid-cols-6`}>
        {(["Delivery", "Takeaway", "Dine-In"] as OrderType[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onOrderTypeChange(mode)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium ${orderType === mode ? palette.sidebarActive : palette.headerPill}`}
          >
            {mode === "Takeaway" ? "Pick Up" : mode}
          </button>
        ))}
        <select
          value={section}
          onChange={(event) => onSectionChange(event.target.value as SectionType)}
          className={`rounded-xl border px-3 py-2 text-sm outline-none ${palette.headerPill}`}
        >
          <option value="AC">AC</option>
          <option value="Non-AC">Non-AC</option>
          <option value="Rooftop">Rooftop</option>
        </select>
        <button
          type="button"
          onClick={onOpenTableView}
          className={`rounded-xl border px-3 py-2 text-sm font-medium ${palette.selectTable}`}
        >
          Table: {tableId ?? "N/A"}
        </button>
        <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${palette.headerPill}`}>
          Persons
          <input
            type="number"
            min={1}
            value={persons}
            onChange={(event) => onPersonsChange(Number(event.target.value || 1))}
            className="w-16 bg-transparent text-right outline-none"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={`rounded-2xl p-3 backdrop-blur-md ${palette.panelSoft}`}>
          <span className={`mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] ${palette.textMuted}`}>
            <Bike className="h-3.5 w-3.5" />
            Mobile
          </span>
          <input
            value={mobile}
            onChange={(event) => onMobileChange(event.target.value)}
            className="w-full bg-transparent text-sm text-red-500 outline-none placeholder:text-red-300"
            placeholder="Enter mobile"
          />
        </label>

        <label className={`rounded-2xl p-3 backdrop-blur-md ${palette.panelSoft}`}>
          <span className={`mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] ${palette.highlight}`}>
            <User className="h-3.5 w-3.5" />
            Name
          </span>
          <input
            value={customerName}
            onChange={(event) => onCustomerNameChange(event.target.value)}
            className="w-full bg-transparent text-sm text-red-500 outline-none placeholder:text-red-300"
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

      <div className={`mt-3 rounded-2xl border p-3 ${palette.panelSoft}`}>
        <div className="mb-2 flex items-center justify-between">
          <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${palette.textMuted}`}>Menu Settings (Manager / Kitchen)</p>
          <p className={`text-xs ${palette.textMuted}`}>Search by food name or token ID</p>
        </div>
        <div className="max-h-48 space-y-2 overflow-auto pr-1">
          {menuSettingsItems.map((menu) => {
            const isActive = menuAvailability[menu.id] ?? menu.isActive ?? true;
            return (
              <div key={menu.id} className={`grid grid-cols-[1.3fr_auto_auto_auto] items-center gap-2 rounded-xl border px-3 py-2 ${palette.gridCard}`}>
                <div>
                  <p className={`text-sm font-medium ${palette.textStrong}`}>{menu.name}</p>
                  <p className={`text-xs ${palette.highlight}`}>Token #{menu.token} | {money(menu.price)}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {isActive ? "Available" : "Unavailable"}
                </span>
                <button
                  type="button"
                  onClick={() => onMenuAvailabilityChange(menu.id, !isActive)}
                  className={`rounded-lg border px-2 py-1 text-xs ${palette.headerPill}`}
                >
                  Mark {isActive ? "Unavailable" : "Available"}
                </button>
                <button
                  type="button"
                  disabled={!isActive}
                  onClick={() => onAddItem(menu)}
                  className={`rounded-lg border px-2 py-1 text-xs ${isActive ? palette.selectTable : `${palette.headerPill} opacity-60`}`}
                >
                  Add
                </button>
              </div>
            );
          })}
          {!menuSettingsItems.length ? (
            <div className={`rounded-xl border p-3 text-sm ${palette.panel} ${palette.textMuted}`}>
              No menu items found for this search.
            </div>
          ) : null}
        </div>
      </div>

      <div className={`mt-4 flex-1 overflow-auto rounded-2xl border ${palette.tableGrid}`}>
        <div className={`grid grid-cols-[2fr_1fr_auto_1fr_1fr] gap-2 border-b px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${palette.textMuted}`}>
          <span>Item</span>
          <span>Token</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Amount</span>
        </div>
        <div className="space-y-1 p-2">
          {items.map((item) => (
            <div key={item.id} className={`grid grid-cols-[2fr_1fr_auto_1fr_1fr] items-center gap-2 rounded-xl px-2 py-2 ${palette.gridCard}`}>
              <p className={`text-sm ${palette.highlight}`}>{item.name}</p>
              <span className={`text-xs ${palette.textMuted}`}>{String(item.id).slice(0, 10).toUpperCase()}</span>
              <div className="inline-flex items-center gap-1">
                <button type="button" onClick={() => onUpdateQty(item.id, -1)} className={`rounded border px-2 py-0.5 text-xs ${palette.headerPill}`}>-</button>
                <span className={`min-w-6 text-center text-sm ${palette.orderText}`}>{item.qty}</span>
                <button type="button" onClick={() => onUpdateQty(item.id, 1)} className={`rounded border px-2 py-0.5 text-xs ${palette.headerPill}`}>+</button>
              </div>
              <span className={`text-sm ${palette.highlight}`}>{money(item.price)}</span>
              <span className={`text-sm font-semibold ${palette.highlight}`}>{money(item.qty * item.price)}</span>
            </div>
          ))}
          {!items.length ? (
            <p className={`px-2 py-4 text-sm ${palette.textMuted}`}>Add food items to generate bill rows.</p>
          ) : null}
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
        <div className={`mt-1 flex items-center justify-between text-sm ${palette.textMuted}`}>
          <span className={palette.highlight}>Discount</span>
          <input type="number" value={discount} min={0} onChange={(event) => setDiscount(Number(event.target.value || 0))} className={`w-24 rounded border px-2 py-1 text-right text-sm ${palette.headerPill} ${palette.highlight}`} />
        </div>
        <div className={`mt-1 flex items-center justify-between text-sm ${palette.textMuted}`}>
          <span>Delivery Charge</span>
          <input type="number" value={deliveryCharge} min={0} onChange={(event) => setDeliveryCharge(Number(event.target.value || 0))} className={`w-24 rounded border px-2 py-1 text-right text-sm ${palette.headerPill}`} />
        </div>
        <div className={`mt-1 flex items-center justify-between text-sm ${palette.textMuted}`}>
          <span>Container Charge</span>
          <input type="number" value={containerCharge} min={0} onChange={(event) => setContainerCharge(Number(event.target.value || 0))} className={`w-24 rounded border px-2 py-1 text-right text-sm ${palette.headerPill}`} />
        </div>
        <div className={`mt-1 flex items-center justify-between text-sm ${palette.textMuted}`}>
          <span>Round Off</span>
          <input type="number" value={roundOff} onChange={(event) => setRoundOff(Number(event.target.value || 0))} className={`w-24 rounded border px-2 py-1 text-right text-sm ${palette.headerPill}`} />
        </div>
        <div className={`mt-1 flex items-center justify-between text-sm ${palette.textMuted}`}>
          <span>Tip</span>
          <input type="number" value={tip} min={0} onChange={(event) => setTip(Number(event.target.value || 0))} className={`w-24 rounded border px-2 py-1 text-right text-sm ${palette.headerPill}`} />
        </div>
        <div className={`mt-2 flex items-center justify-between border-t pt-2 text-base font-semibold ${palette.textStrong} ${isDark ? "border-white/10" : "border-black/5"}`}>
          <span>Grand Total</span>
          <span>{money(adjustedTotal)}</span>
        </div>
        <div className={`mt-1 flex items-center justify-between text-sm ${palette.textMuted}`}>
          <span>Customer Paid</span>
          <input type="number" value={customerPaid} min={0} onChange={(event) => setCustomerPaid(Number(event.target.value || 0))} className={`w-24 rounded border px-2 py-1 text-right text-sm ${palette.headerPill}`} />
        </div>
        <div className={`mt-1 flex items-center justify-between text-sm ${returnToCustomer < 0 ? "text-rose-500" : palette.textMuted}`}>
          <span>Return to Customer</span>
          <span>{money(returnToCustomer)}</span>
        </div>
      </div>

      <div className={`mt-4 rounded-3xl p-3 backdrop-blur-lg ${palette.paymentPanel}`}>
        <div className="grid gap-2 sm:grid-cols-6">
          {([
            { key: "Cash", icon: Wallet },
            { key: "Card", icon: Wallet },
            { key: "Due", icon: Wallet },
            { key: "Other", icon: Wallet },
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
                className="w-full bg-transparent text-sm text-red-500 outline-none placeholder:text-red-300"
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
                className="w-full bg-transparent text-sm text-red-500 outline-none placeholder:text-red-300"
              />
            </label>
            <p className={`sm:col-span-2 text-xs ${palette.textMuted}`}>
              Split total: {money(splitCash + splitUpi)} | Bill total: {money(adjustedTotal)}
            </p>
          </div>
        ) : null}

        <div className="mt-3 grid gap-2 sm:grid-cols-5">
          <button
            type="button"
            onClick={onSaveAndPrint}
            disabled={isSavingAndPrinting || isSavingAndEbill || isSettlingAndSaving || isCreatingKOT || isCreatingKOTPrint}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-[#f06a5a]/35 bg-[#f06a5a]/18 text-[#ffd8d3]" : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"}`}
          >
            <Printer className="h-4 w-4" />
            {isSavingAndPrinting ? "Saving..." : "Save & Print"}
          </button>
          <button
            type="button"
            onClick={onSaveAndEbill}
            disabled={isSavingAndPrinting || isSavingAndEbill || isSettlingAndSaving || isCreatingKOT || isCreatingKOTPrint}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${palette.headerPill}`}
          >
            {isSavingAndEbill ? "Sending EBill..." : "Save & EBill"}
          </button>
          <button
            type="button"
            onClick={onKOT}
            disabled={isSavingAndPrinting || isSavingAndEbill || isSettlingAndSaving || isCreatingKOT || isCreatingKOTPrint}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${palette.headerPill}`}
          >
            {isCreatingKOT ? "Saving KOT..." : "KOT"}
          </button>
          <button
            type="button"
            onClick={onKOTPrint}
            disabled={isSavingAndPrinting || isSavingAndEbill || isSettlingAndSaving || isCreatingKOT || isCreatingKOTPrint}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${palette.headerPill}`}
          >
            {isCreatingKOTPrint ? "Printing KOT..." : "KOT & Print"}
          </button>
          <button
            type="button"
            onClick={onSettleAndSave}
            disabled={!hasCurrentOrder || isSavingAndPrinting || isSavingAndEbill || isSettlingAndSaving || isCreatingKOT || isCreatingKOTPrint}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-[#6be7cf]/25 bg-[#6be7cf]/12 text-[#d8fff7]" : "border-[#2f9e88]/20 bg-[#2f9e88]/10 text-[#14564a]"}`}
          >
            <Calculator className="h-4 w-4" />
            {isSettlingAndSaving ? "Settling..." : "Settle & Save"}
          </button>
        </div>
      </div>
    </section>
  );
}
