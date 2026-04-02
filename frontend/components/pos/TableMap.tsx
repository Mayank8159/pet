"use client";

import { motion } from "framer-motion";
import { DoorOpen, MapPinHouse, Waves } from "lucide-react";
import type { TableNode } from "./types";

interface TableMapProps {
  tables: TableNode[];
  activeTableId: string | null;
  onSelectTable: (tableId: string) => void;
}

const statusStyles: Record<TableNode["status"], string> = {
  Available:
    "from-emerald-300/90 via-cyan-300/80 to-teal-400/90 text-white shadow-[0_20px_50px_rgba(16,185,129,0.25)]",
  Occupied:
    "from-amber-300/90 via-orange-300/80 to-rose-400/90 text-white shadow-[0_20px_50px_rgba(251,146,60,0.25)]",
  Billing:
    "from-sky-300/90 via-blue-400/80 to-indigo-500/90 text-white shadow-[0_20px_50px_rgba(59,130,246,0.25)]",
};

export function TableMap({ tables, activeTableId, onSelectTable }: TableMapProps) {
  return (
    <section className="rounded-[32px] border border-white/12 bg-white/8 p-5 shadow-[0_30px_100px_rgba(8,15,29,0.35)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-cyan-200/70">Dining floor plan</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Interactive table map</h2>
        </div>
        <div className="grid gap-2 text-right text-xs text-slate-300 sm:grid-cols-3 sm:gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-white">Service path</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-cyan-200">
              <Waves className="h-3.5 w-3.5" />
              Clear
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-white">Host stand</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-slate-200">
              <MapPinHouse className="h-3.5 w-3.5" />
              North wing
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-white">Back hall</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-slate-200">
              <DoorOpen className="h-3.5 w-3.5" />
              Kitchen route
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-5 h-[30rem] overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(103,232,249,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.13),_transparent_34%),linear-gradient(145deg,_rgba(10,17,31,0.98),_rgba(15,23,42,0.92))] p-4">
        <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="absolute inset-x-6 top-6 h-20 rounded-[28px] border border-white/10 bg-white/6 backdrop-blur-sm" />
        <div className="absolute left-6 top-6 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-cyan-100/80 backdrop-blur-sm">
          Entry
        </div>
        <div className="absolute right-6 bottom-6 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200/80 backdrop-blur-sm">
          Kitchen
        </div>
        <div className="absolute left-1/2 top-1/2 h-44 w-20 -translate-x-1/2 -translate-y-1/2 rounded-[32px] border border-white/10 bg-white/6 shadow-inner shadow-black/25 backdrop-blur-sm" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-center text-xs uppercase tracking-[0.35em] text-white/75 backdrop-blur-md">
          Central aisle
        </div>

        {tables.map((table) => {
          const isActive = activeTableId === table.id;

          return (
            <motion.button
              key={table.id}
              type="button"
              layout
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectTable(table.id)}
              className={`absolute flex flex-col items-center justify-center gap-1 border text-white transition-all duration-200 ${
                table.shape === "round" ? "rounded-full" : "rounded-[30px]"
              } ${statusStyles[table.status]} ${isActive ? "ring-4 ring-white/80 ring-offset-2 ring-offset-slate-950" : "border-white/10"}`}
              style={{
                top: table.top,
                left: table.left,
                width: table.width,
                height: table.height,
              }}
            >
              <span className="text-lg font-semibold tracking-tight">{table.name}</span>
              <span className="text-[11px] uppercase tracking-[0.28em] text-white/80">{table.seats} seats</span>
              <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-white/90">
                {table.status}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}