import Image from "next/image";

type SiteFooterProps = {
  awards: string[];
};

export function SiteFooter({ awards }: SiteFooterProps) {
  const year = new Date().getFullYear();

  const legalLinks = ["Privacy", "Compliance", "Terms", "Cancellation & Refund"];
  const quickLinks = ["Products", "Pricing", "Resources", "Contact"];

  return (
    <footer className="bg-gradient-to-b from-[#041b35] to-[#021426] py-10 text-[#e8eef6] md:py-12">
      <div className="mx-auto w-[92%] max-w-[1510px]">
        <div className="grid grid-cols-1 items-center gap-5 border-b border-white/16 pb-7 md:grid-cols-[1fr_1.2fr_auto] md:gap-6">
          <a href="#" aria-label="Tabio home" className="inline-flex items-center">
            <Image
              src="/tablogo.png"
              alt="Tabio logo"
              width={152}
              height={40}
              className="h-auto w-[118px] md:w-[132px]"
            />
          </a>
          <p className="text-left text-sm leading-relaxed text-[#d4dfec] md:text-center md:text-base">
            Connect with us: (+91) 91043 69797 · inquiry@tabio.com
          </p>
          <div className="flex items-center gap-2 md:justify-end">
            {['in', 'ig', 'yt', 'fb'].map((social) => (
              <a
                key={social}
                href="#"
                aria-label={`Visit our ${social} page`}
                className="grid size-10 place-items-center rounded-full border border-white/45 bg-white/5 text-xs font-semibold uppercase tracking-wide transition hover:border-white hover:bg-white/12"
              >
                {social}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 text-left text-xl font-semibold tracking-tight md:text-center md:text-3xl">
          We&apos;re the best, we told you already!
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {awards.map((award) => (
            <div
              key={award}
              className="grid min-h-[108px] place-items-center rounded-xl border border-white/14 bg-white/90 px-3 py-2 text-center text-xs font-semibold text-[#1f2027] shadow-[0_8px_24px_rgba(0,0,0,0.18)] md:min-h-[116px] md:text-sm"
            >
              {award}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/14 pt-5 text-xs text-[#b8c5d5] md:flex-row md:items-center md:justify-between md:text-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {quickLinks.map((link) => (
              <a key={link} href="#" className="transition hover:text-white">
                {link}
              </a>
            ))}
          </div>

          <p className="text-left md:text-right">
            {year} Tabio, India
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#98a9bf] md:justify-center md:text-sm">
          {legalLinks.map((link) => (
            <a key={link} href="#" className="transition hover:text-white">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
