'use client';

import React, { useState } from 'react';
import { Zap, Wallet, FileText, ShoppingCart, CheckSquare } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type ModuleSectionProps = {
  featureTabs: string[];
};

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  POS: Zap,
  Payroll: Wallet,
  Invoice: FileText,
  Purchase: ShoppingCart,
  Tasks: CheckSquare,
};

export function ModuleSection({ featureTabs }: ModuleSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <section className="bg-[#f5f5f6] px-0 pt-24 pb-14 text-center md:pt-32 md:pb-20">
      <div className="mx-auto w-[92%] max-w-[1510px]">
        <div className="inline-flex flex-wrap items-center justify-center gap-3 md:gap-6">
          {featureTabs.map((tab, index) => {
            const Icon = iconMap[tab];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`rounded-xl px-6 py-2.5 text-base transition md:text-lg flex items-center gap-2 font-semibold backdrop-blur-sm border ${
                  index === activeTab
                    ? "bg-gradient-to-r from-[#cf1e38]/20 to-[#cf1e38]/10 text-[#cf1e38] border-[#cf1e38]/30 hover:border-[#cf1e38]/50"
                    : "text-[#101827] border-transparent hover:bg-white/40 hover:border-gray-300/30 hover:shadow-lg"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab}
              </button>
            );
          })}
        </div>

        <h2 className="mt-8 text-[2rem] font-medium md:text-[3.2rem]">
          Restaurant POS software made simple!
        </h2>
        <p className="mx-auto mt-4 max-w-4xl text-base text-[#344960] md:text-xl">
          Manage all your restaurant operations efficiently so you can grow your
          brand like a real boss!
        </p>
        <a
          href="#"
          className="mt-4 inline-block text-base text-[#cf1e38] underline underline-offset-[6px] md:text-xl"
        >
          Explore POS
        </a>
      </div>
    </section>
  );
}
