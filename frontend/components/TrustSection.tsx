type TrustSectionProps = {
  trustedBrands: string[];
};

export function TrustSection({ trustedBrands }: TrustSectionProps) {
  return (
    <section className="pb-8">
      <div className="mx-auto w-[92%] max-w-[1510px] rounded-[28px] bg-[#f1eef2] px-6 py-10">
        <h3 className="text-center text-lg font-medium tracking-wide md:text-[1.7rem]">
          TRUSTED BY <span className="font-bold text-[#cf1e38]">1,00,000+</span>{" "}
          BUSINESSES ACROSS THE GLOBE
        </h3>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {trustedBrands.map((brand) => (
            <div
              key={brand}
              className="grid min-h-[74px] place-items-center rounded-xl border border-white/30 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md px-2 text-center text-sm font-semibold text-[#2c3647] transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,34,54,0.15)] hover:border-white/50"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
