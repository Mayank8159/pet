"use client";

import { Dialog } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutGrid, Plus, Sparkles, Trash2, X } from "lucide-react";
import type { Palette, TableNode, TableStatus } from "./types";

type TableManagementModalProps = {
  show: boolean;
  onClose: () => void;
  isDark: boolean;
  palette: Palette;
  tables: TableNode[];
  selectedTableLabel?: string;
  selectedTableId?: string | null;
  candidateTableId?: string | null;
  tableStats: { available: number; occupied: number; cleaning: number; reserved: number };
  newTableLabel: string;
  newTableStatus: TableStatus;
  onNewTableLabelChange: (value: string) => void;
  onNewTableStatusChange: (value: TableStatus) => void;
  onAddTable: () => void;
  onSelectTable: (tableId: string) => void;
  onToggleStatus: (tableId: string) => void;
  onDeleteTable: (tableId: string) => void;
  onConfirmCurrentOrderTable: () => void;
};

export function TableManagementModal({
  show,
  onClose,
  isDark,
  palette,
  tables,
  selectedTableLabel,
  selectedTableId,
  candidateTableId,
  tableStats,
  newTableLabel,
  newTableStatus,
  onNewTableLabelChange,
  onNewTableStatusChange,
  onAddTable,
  onSelectTable,
  onToggleStatus,
  onDeleteTable,
  onConfirmCurrentOrderTable,
}: TableManagementModalProps) {
  return (
    <AnimatePresence>
      {show ? (
        <Dialog open={show} onClose={onClose} className="relative z-[300]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[300] backdrop-blur-sm ${palette.modalOverlay}`}
          />
          <div className="fixed inset-0 z-[310] flex items-center justify-center p-4">
            <Dialog.Panel
              as={motion.div}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              className={`relative z-[320] w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl p-5 shadow-[0_24px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl ${palette.modal}`}
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Dialog.Title className={`inline-flex items-center gap-2 text-xl font-semibold ${palette.textStrong}`}>
                    <LayoutGrid className={`h-5 w-5 ${isDark ? "text-[#ff9f8f]" : "text-[#cc4b3e]"}`} />
                    Table Management
                  </Dialog.Title>
                  <p className={`mt-1 text-sm ${palette.textMuted}`}>
                    Add tables, set Available/Occupied/Cleaning/Reserved status, and assign one to the active order.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className={`rounded-xl border p-2 transition ${palette.headerPill}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                <div className={`rounded-3xl border p-4 ${palette.panelSoft}`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`rounded-2xl border px-3 py-3 ${isDark ? "border-emerald-300/15 bg-emerald-300/10" : "border-emerald-300/20 bg-emerald-50"}`}>
                      <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-emerald-200/80" : "text-emerald-700"}`}>Available</p>
                      <p className={`mt-2 text-2xl font-semibold ${palette.textStrong}`}>{tableStats.available}</p>
                    </div>
                    <div className={`rounded-2xl border px-3 py-3 ${isDark ? "border-rose-300/15 bg-rose-300/10" : "border-rose-300/20 bg-rose-50"}`}>
                      <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-rose-200/80" : "text-rose-700"}`}>Occupied</p>
                      <p className={`mt-2 text-2xl font-semibold ${palette.textStrong}`}>{tableStats.occupied}</p>
                    </div>
                    <div className={`rounded-2xl border px-3 py-3 ${isDark ? "border-amber-300/15 bg-amber-300/10" : "border-amber-300/20 bg-amber-50"}`}>
                      <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-amber-200/80" : "text-amber-700"}`}>Cleaning</p>
                      <p className={`mt-2 text-2xl font-semibold ${palette.textStrong}`}>{tableStats.cleaning}</p>
                    </div>
                    <div className={`rounded-2xl border px-3 py-3 ${isDark ? "border-sky-300/15 bg-sky-300/10" : "border-sky-300/20 bg-sky-50"}`}>
                      <p className={`text-xs uppercase tracking-[0.18em] ${isDark ? "text-sky-200/80" : "text-sky-700"}`}>Reserved</p>
                      <p className={`mt-2 text-2xl font-semibold ${palette.textStrong}`}>{tableStats.reserved}</p>
                    </div>
                  </div>

                  <div className={`mt-4 rounded-2xl border p-3 ${palette.panel}`}>
                    <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${palette.textMuted}`}>Add Table</p>
                    <div className="mt-2 space-y-2">
                      <input
                        value={newTableLabel}
                        onChange={(event) => onNewTableLabelChange(event.target.value)}
                        placeholder="Table number, e.g. 9"
                        className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${palette.headerPill}`}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <label className="relative block">
                          <select
                            value={newTableStatus}
                            onChange={(event) => onNewTableStatusChange(event.target.value as TableStatus)}
                            className={`w-full appearance-none rounded-xl border px-3 py-2 pr-9 text-sm outline-none ${palette.headerPill}`}
                          >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Reserved">Reserved</option>
                          </select>
                          <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-slate-300" : "text-slate-500"}`} />
                        </label>
                        <button
                          type="button"
                          onClick={onAddTable}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${isDark ? "bg-[#f06a5a]/18 text-[#ffd8d3] hover:bg-[#f06a5a]/25" : "bg-[#cc4b3e]/12 text-[#7f1d16] hover:bg-[#cc4b3e]/18"}`}
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className="inline-block h-3 w-3 rounded-full bg-emerald-400" />
                    <span className={palette.textMuted}>Available</span>
                    <span className="ml-3 inline-block h-3 w-3 rounded-full bg-rose-400" />
                    <span className={palette.textMuted}>Occupied</span>
                    <span className="ml-3 inline-block h-3 w-3 rounded-full bg-amber-400" />
                    <span className={palette.textMuted}>Cleaning</span>
                    <span className="ml-3 inline-block h-3 w-3 rounded-full bg-sky-400" />
                    <span className={palette.textMuted}>Reserved</span>
                  </div>

                  <div className={`mt-4 rounded-2xl border p-3 ${palette.panel}`}>
                    <p className={`text-sm font-medium ${palette.textStrong}`}>New Order Table</p>
                    <p className={`mt-1 text-sm ${palette.textMuted}`}>
                      {selectedTableLabel ? `Table ${selectedTableLabel} is assigned.` : "No table assigned yet."}
                    </p>
                    <p className={`mt-1 text-sm ${palette.textMuted}`}>
                      {candidateTableId ? `Candidate: ${candidateTableId}` : "No candidate selected."}
                    </p>
                    <button
                      type="button"
                      onClick={onConfirmCurrentOrderTable}
                      disabled={!candidateTableId}
                      className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${isDark ? "border-white/10 bg-white/5 text-slate-100 disabled:opacity-50" : "border-black/5 bg-white text-slate-800 disabled:opacity-50"}`}
                    >
                      <Sparkles className="h-4 w-4" />
                      Confirm selected table
                    </button>
                  </div>
                </div>

                <div className={`rounded-3xl border p-4 ${palette.modalGrid}`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${palette.textMuted}`}>Floor Grid</p>
                      <p className={`mt-1 text-sm ${palette.textMuted}`}>Click a table to assign it to the new order.</p>
                    </div>
                    <div className={`rounded-2xl border px-3 py-2 text-sm ${palette.headerPill}`}>
                      {tables.length} tables total
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    {tables.map((table) => {
                      const isSelected = selectedTableId === table.id;
                      const isCandidate = candidateTableId === table.id;
                      const isAvailable = table.status === "Available";
                      const isCleaning = table.status === "Cleaning";
                      const isReserved = table.status === "Reserved";
                      const canAssign = (isAvailable || isCleaning) || isSelected;

                      return (
                        <div
                          key={table.id}
                          className={`rounded-3xl border p-4 transition ${
                            isAvailable
                              ? isDark
                                ? "border-emerald-300/25 bg-emerald-300/10"
                                : "border-emerald-300/30 bg-emerald-50"
                              : isCleaning
                                ? isDark
                                  ? "border-amber-300/25 bg-amber-300/10"
                                  : "border-amber-300/30 bg-amber-50"
                              : isReserved
                                ? isDark
                                  ? "border-sky-300/25 bg-sky-300/10"
                                  : "border-sky-300/30 bg-sky-50"
                              : isDark
                                ? "border-rose-300/25 bg-rose-300/10"
                                : "border-rose-300/30 bg-rose-50"
                          } ${isCandidate ? `ring-2 ${isDark ? "ring-[#ff9f8f]" : "ring-[#cc4b3e]"}` : ""}`}
                        >
                          <button
                            type="button"
                            onClick={() => onSelectTable(table.id)}
                            disabled={!canAssign}
                            className={`w-full text-left ${!canAssign ? "cursor-not-allowed opacity-70" : ""}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-base font-semibold ${palette.textStrong}`}>{table.label}</p>
                                <p className={`mt-1 text-xs uppercase tracking-[0.18em] ${palette.textMuted}`}>{table.id}</p>
                              </div>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isAvailable
                                  ? isDark
                                    ? "bg-emerald-300/15 text-emerald-100"
                                    : "bg-emerald-100 text-emerald-700"
                                  : isCleaning
                                    ? isDark
                                      ? "bg-amber-300/15 text-amber-100"
                                      : "bg-amber-100 text-amber-700"
                                  : isReserved
                                    ? isDark
                                      ? "bg-sky-300/15 text-sky-100"
                                      : "bg-sky-100 text-sky-700"
                                  : isDark
                                    ? "bg-rose-300/15 text-rose-100"
                                    : "bg-rose-100 text-rose-700"
                              }`}>
                                {table.status}
                              </span>
                            </div>
                            <div className={`mt-4 rounded-2xl border px-3 py-2 text-sm ${palette.panelSoft}`}>
                              {isCandidate
                                ? "Candidate selected"
                                : isSelected
                                  ? "Currently assigned"
                                : isAvailable
                                  ? "Ready for service"
                                  : isCleaning
                                    ? "Cleaning in progress - can still assign"
                                  : isReserved
                                    ? "Reserved - switch to available/cleaning to assign"
                                    : "Occupied - mark available/cleaning to assign"}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleStatus(table.id)}
                            className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                              isAvailable
                                ? isDark
                                  ? "border-[#f06a5a]/30 bg-[#f06a5a]/15 text-[#ffd8d3]"
                                  : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"
                                : isCleaning
                                  ? isDark
                                    ? "border-amber-300/25 bg-amber-300/15 text-amber-100"
                                    : "border-amber-300/30 bg-amber-100 text-amber-800"
                                : isReserved
                                  ? isDark
                                    ? "border-sky-300/25 bg-sky-300/15 text-sky-100"
                                    : "border-sky-300/30 bg-sky-100 text-sky-800"
                                : isDark
                                  ? "border-[#6be7cf]/25 bg-[#6be7cf]/12 text-[#d8fff7]"
                                  : "border-[#2f9e88]/20 bg-[#2f9e88]/10 text-[#14564a]"
                            }`}
                          >
                            {isAvailable ? "Mark Occupied" : isCleaning ? "Mark Reserved" : isReserved ? "Mark Available" : "Mark Cleaning"}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteTable(table.id)}
                            className={`mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                              isDark
                                ? "border-rose-300/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
                                : "border-rose-300/40 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Table
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className={`text-sm ${palette.textMuted}`}>
                  Use the grid to keep table status accurate. Green means ready, amber means cleaning, red means occupied.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${isDark ? "border-[#f06a5a]/30 bg-[#f06a5a]/15 text-[#ffd8d3]" : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"}`}
                >
                  <Sparkles className="h-4 w-4" />
                  Done
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}
