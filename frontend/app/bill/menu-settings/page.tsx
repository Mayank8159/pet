"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MoonStar, SunMedium, UtensilsCrossed } from "lucide-react";
import { BillSidebar } from "@/components/bill/BillSidebar";

const DUMMY_MENU_SETTINGS = [
  { token: "FD101", name: "Paneer Tikka", price: 320, tag: "Tandoori" },
  { token: "FD102", name: "Hara Bhara Kabab", price: 280, tag: "Veggie" },
  { token: "FD103", name: "Veg Manchurian", price: 240, tag: "Indo-Chinese" },
  { token: "FD104", name: "Chilli Paneer", price: 290, tag: "Spicy" },
  { token: "FD105", name: "Crispy Corn", price: 220, tag: "Crunchy" },
  { token: "FD106", name: "Mushroom Duplex", price: 310, tag: "Chef Special" },
  { token: "FD107", name: "Dahi Ke Sholay", price: 260, tag: "Classic" },
  { token: "FD108", name: "Soya Chaap Tikka", price: 270, tag: "Protein" },
  { token: "FD109", name: "Aloo Tikki Chaat", price: 150, tag: "Street Food" },
  { token: "FD110", name: "Paneer 65", price: 280, tag: "Spicy" },
  { token: "FD111", name: "Chicken Tikka", price: 380, tag: "Tandoori" },
  { token: "FD112", name: "Murgh Malai Tikka", price: 410, tag: "Creamy" },
  { token: "FD113", name: "Chicken 65", price: 350, tag: "Spicy" },
  { token: "FD114", name: "Fish Amritsari", price: 450, tag: "Fried" },
  { token: "FD115", name: "Mutton Seekh Kabab", price: 480, tag: "Grill" },
  { token: "FD116", name: "Tandoori Chicken (Full)", price: 550, tag: "Classic" },
  { token: "FD117", name: "Chicken Lollipop", price: 320, tag: "Kids Choice" },
  { token: "FD118", name: "Garlic Butter Prawns", price: 580, tag: "Seafood" },
  { token: "FD119", name: "Chicken Seekh Kabab", price: 360, tag: "Grill" },
  { token: "FD120", name: "Afghani Chicken", price: 420, tag: "Mild" },
];

export default function MenuSettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    Object.fromEntries(DUMMY_MENU_SETTINGS.map((item) => [item.token, true])),
  );
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
  const filtered = DUMMY_MENU_SETTINGS.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return true;
    }
    return `${item.name} ${item.token} ${item.tag}`.toLowerCase().includes(q);
  });

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
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-6">
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
              <p className={`text-xs uppercase tracking-[0.2em] ${isDark ? "text-[#ffb09a]" : "text-[#cc4b3e]"}`}>Menu Settings</p>
              <h1 className="mt-2 text-3xl font-semibold">Manager & Kitchen Availability</h1>
            </header>

            <section
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-white/10 bg-white/5 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                  : "border-[#ffd8c6] bg-white/90 shadow-[0_10px_30px_rgba(204,75,62,0.08)]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <UtensilsCrossed className="mt-0.5 h-5 w-5 text-[#cc4b3e]" />
                  <div className="space-y-2">
                    <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Every dummy food item is listed below. Search by food name or token and mark availability.
                    </p>
                  </div>
                </div>

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by food name or token"
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? "border-white/10 bg-white/5 text-slate-100" : "border-[#ffd8c6] bg-white text-slate-900"}`}
                />

                <div className="max-h-[460px] space-y-2 overflow-auto pr-1">
                  {filtered.map((item) => {
                    const isAvailable = availability[item.token] ?? true;
                    return (
                      <div
                        key={item.token}
                        className={`grid grid-cols-[1.3fr_auto_auto] items-center gap-3 rounded-xl border px-3 py-2 ${isDark ? "border-white/10 bg-white/5" : "border-[#ffd8c6] bg-white"}`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-900"}`}>{item.name}</p>
                          <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>Token #{item.token} | {item.tag} | Rs {item.price}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAvailability((prev) => ({
                              ...prev,
                              [item.token]: !isAvailable,
                            }))
                          }
                          className={`rounded-lg border px-2 py-1 text-xs ${isDark ? "border-white/15 bg-white/5 text-slate-100" : "border-[#ffd8c6] bg-white text-[#8a2d22]"}`}
                        >
                          Mark {isAvailable ? "Unavailable" : "Available"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/bill"
                  className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium ${
                    isDark
                      ? "border-[#f06a5a]/35 bg-[#f06a5a]/18 text-[#ffd8d3]"
                      : "border-[#cc4b3e]/20 bg-[#cc4b3e]/12 text-[#7f1d16]"
                  }`}
                >
                  Back To Billing
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
