import Image from "next/image";

type SiteFooterProps = {
  awards: string[];
};

export function SiteFooter({ awards }: SiteFooterProps) {
  return (
    <footer className="bg-[#031a33] py-8 text-[#e8eef6]">
      <div className="mx-auto w-[92%] max-w-[1510px]">
        <div className="grid grid-cols-1 items-center gap-4 border-b border-white/16 pb-6 md:grid-cols-[1fr_1.3fr_auto]">
          <a href="#" aria-label="Tabio home" className="inline-flex items-center">
            <Image
              src="/tablogo.png"
              alt="Tabio logo"
              width={152}
              height={40}
              className="h-auto w-[118px] md:w-[132px]"
            />
          </a>
          <p className="text-left text-sm md:text-center md:text-base">
            Connect with us: (+91) 91043 69797 · inquiry@tabio.com
          </p>
          <div className="flex items-center gap-2 md:justify-end">
            {['in', 'ig', 'yt', 'fb'].map((social) => (
              <span
                key={social}
                className="grid size-11 place-items-center rounded-full border border-white/60 text-sm"
              >
                {social}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 text-left text-xl font-semibold md:text-center md:text-3xl">
          We&apos;re the best, we told you already!
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {awards.map((award) => (
            <div
              key={award}
              className="grid min-h-[118px] place-items-center rounded-xl bg-[#f6f7f9] p-2 text-center text-xs font-semibold text-[#1f2027] md:text-sm"
            >
              {award}
            </div>
          ))}
        </div>

        <p className="mt-6 text-left text-xs text-[#adb7c6] md:text-center md:text-sm">
          2026 Tabio, India · Privacy · Compliance · Terms · Cancellation & Refund
        </p>
      </div>
    </footer>
  );
}
