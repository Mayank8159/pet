"use client";

import { BarChart3, ClipboardList, FileText, PieChart, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BillSidebarProps = {
  isDark: boolean;
};

export function BillSidebar({ isDark }: BillSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`hidden w-28 flex-col p-3 backdrop-blur-xl lg:flex ${isDark ? "border-white/8 bg-[#08101a]/90" : "border-white/8 bg-[#fff7f2]/95"}`}>
      <div className={`mb-4 rounded-2xl border p-3 text-center shadow-[0_12px_30px_rgba(0,0,0,0.2)] ${isDark ? "border-white/8 bg-white/[0.06]" : "border-black/5 bg-white"}`}>
        <p className={`text-xs font-semibold tracking-[0.2em] ${isDark ? "text-[#ff9f8f]" : "text-[#cc4b3e]"}`}>POS</p>
      </div>

      <nav className="space-y-2 text-xs">
        {[
          { label: "Billing", icon: FileText, href: "/bill" },
          { label: "Operations", icon: ClipboardList, href: "/bill/operations" },
          { label: "Reports", icon: BarChart3, href: "/bill/reports" },
          { label: "Live View", icon: PieChart, href: "/bill/live-view" },
          { label: "Settings", icon: Settings, href: "/bill/settings" },
        ].map((entry) => {
          const isActive = pathname === entry.href || pathname.startsWith(`${entry.href}/`);

          return (
            <Link
              key={entry.label}
              href={entry.href}
              className={`flex w-full flex-col items-center gap-1 rounded-xl border p-2.5 text-center leading-tight transition ${
                isActive
                  ? isDark
                    ? "border-[#f06a5a]/35 bg-[#f06a5a]/14 text-[#ffd8d3]"
                    : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"
                  : isDark
                    ? "border-white/8 bg-white/[0.045] text-slate-300 hover:bg-white/10"
                    : "border-black/5 bg-white/75 text-slate-700 hover:bg-white"
              }`}
            >
              <entry.icon className="h-5 w-5" />
              <span>{entry.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}