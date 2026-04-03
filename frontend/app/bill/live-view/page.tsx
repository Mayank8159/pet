"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MoonStar, SunMedium } from "lucide-react";
import { BillSidebar } from "@/components/bill/BillSidebar";
import { LiveViewPanel } from "@/components/bill/LiveViewPanel";

export default function LiveViewPage() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const isThemeReadyRef = useRef(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("pos-theme");
    window.setTimeout(() => {
      isThemeReadyRef.current = true;
      if (savedTheme === "dark") {
        setTheme("dark");
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!isThemeReadyRef.current) {
      return;
    }
    window.localStorage.setItem("pos-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-[radial-gradient(circle_at_top_left,#1e0d0b,#0b0f1a_45%,#080b14)] text-slate-100"
          : "bg-[radial-gradient(circle_at_top_left,#ffe7d6,#fff6ee_40%,#fffaf5)] text-slate-900"
      }`}
    >
      <div className="flex min-h-screen">
        <BillSidebar isDark={isDark} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/bill"
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
                  isDark ? "border-white/15 bg-white/5 text-slate-100" : "border-[#ffd8c6] bg-white text-[#8a2d22]"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Billing
              </Link>
              <button
                type="button"
                onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${
                  isDark ? "border-white/15 bg-white/5 text-slate-100" : "border-[#ffd8c6] bg-white text-[#8a2d22]"
                }`}
              >
                {isDark ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                {isDark ? "Light" : "Dark"}
              </button>
            </div>

            <header>
              <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? "text-[#ffb09a]" : "text-[#cc4b3e]"}`}>Live View</p>
              <h1 className="mt-2 text-3xl font-semibold">Order Preparation Status</h1>
            </header>

            <LiveViewPanel />
          </div>
        </main>
      </div>
    </div>
  );
}
