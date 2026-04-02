'use client';

import React from "react";
import { Lightbulb, Target, Zap, Headphones } from "lucide-react";
import type { LucideProps } from "lucide-react";

type WhyCard = {
  title: string;
  text: string;
};

type WhySectionProps = {
  whyCards: WhyCard[];
};

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  "Continuous Innovation": Lightbulb,
  "Pricing": Target,
  "Simplicity": Zap,
  "24x7 Support": Headphones,
};

export function WhySection({ whyCards }: WhySectionProps) {
  return (
    <section className="mt-6 rounded-t-[36px] bg-gradient-to-r from-[#001a31] via-[#032448] to-[#02213f] py-12">
      <div className="mx-auto w-[92%] max-w-[1510px]">
        <div className="mx-auto w-fit rounded-full border border-white/65 px-8 py-3 text-sm font-semibold tracking-wide text-white md:text-lg">
          WHY OUR CLIENTS LOVE US
        </div>

        <h2 className="mx-auto mt-8 max-w-4xl text-center text-[2rem] leading-[1.08] font-medium text-white md:text-[3.4rem]">
          Simplicity meets excellence
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {whyCards.map((card, index) => {
            const Icon = iconMap[card.title];
            return (
              <article
                key={card.title}
                className={`rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,9,24,0.4)] hover:border-white/40 ${
                  index === 0 ? "md:col-span-2" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {Icon && (
                    <div className="rounded-lg bg-[#cf1e38]/20 p-3 flex-shrink-0 backdrop-blur-sm">
                      <Icon className="w-6 h-6 text-[#cf1e38]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white md:text-[1.9rem]">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-base text-[#9eb4c8] md:text-lg">{card.text}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
