"use client";

import { motion } from "framer-motion";
import { Flame, Plus, Search, Sparkles, UtensilsCrossed } from "lucide-react";
import { useMemo } from "react";
import type { MenuItem } from "./types";

interface MenuGridProps {
  items: MenuItem[];
  query: string;
  onQueryChange: (value: string) => void;
  onAddItem: (item: MenuItem) => void;
}

const categoryBadges: Record<string, string> = {
  Starters: "from-amber-300 to-orange-400",
  Mains: "from-sky-300 to-cyan-400",
  Snacks: "from-fuchsia-300 to-pink-400",
  Drinks: "from-emerald-300 to-teal-400",
  Seafood: "from-indigo-300 to-violet-400",
  Dessert: "from-rose-300 to-amber-300",
};

function getCategoryIcon(category: string) {
  if (category === "Drinks") {
    return <Sparkles className="h-4 w-4" />;
  }

  if (category === "Dessert") {
    return <Flame className="h-4 w-4" />;
  }

  return <UtensilsCrossed className="h-4 w-4" />;
}

export function MenuGrid({ items, query, onQueryChange, onAddItem }: MenuGridProps) {
  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return items;
    }

    return items.filter((item) => {
      const haystack = `${item.name} ${item.description} ${item.category} ${item.badge}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [items, query]);

  return (
    <section className="rounded-[32px] border border-white/12 bg-white/8 p-5 shadow-[0_30px_100px_rgba(8,15,29,0.35)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-fuchsia-100/70">Food gallery</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Search and add items fast</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-200/80">
          {visibleItems.length} dishes
        </div>
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-[24px] border border-white/12 bg-slate-950/35 px-4 py-3 text-slate-100 shadow-inner shadow-black/20 backdrop-blur-sm">
        <Search className="h-5 w-5 text-cyan-200/80" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search dishes, badges, or categories"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <motion.article
            key={item.id}
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group rounded-[28px] border border-white/12 bg-gradient-to-br from-white/12 via-white/8 to-white/5 p-4 shadow-[0_20px_50px_rgba(8,15,29,0.22)] transition-all duration-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${categoryBadges[item.category] ?? "from-slate-400 to-slate-500"} px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-950`}>
                  {getCategoryIcon(item.category)}
                  {item.category}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.name}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-white/85">
                {item.badge}
              </span>
            </div>

            <p className="mt-3 min-h-12 text-sm leading-6 text-slate-300">{item.description}</p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Price</p>
                <p className="mt-1 text-2xl font-semibold text-white">Rs {item.price}</p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => onAddItem(item)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_16px_30px_rgba(255,255,255,0.18)] transition hover:bg-cyan-100"
              >
                <Plus className="h-4 w-4" />
                Add
              </motion.button>
            </div>
          </motion.article>
        ))}
      </div>

      {visibleItems.length === 0 ? (
        <div className="mt-5 rounded-[28px] border border-dashed border-white/15 bg-white/5 px-5 py-8 text-center text-sm text-slate-300">
          No dishes match this search. Try a category or badge name.
        </div>
      ) : null}
    </section>
  );
}