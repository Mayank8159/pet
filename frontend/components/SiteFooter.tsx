import Image from "next/image";
import type { SVGProps } from "react";

function LinkedInLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.94 8.5a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88ZM5.7 9.75h2.48V18H5.7V9.75Zm4.03 0h2.37v1.13h.04c.33-.63 1.14-1.3 2.36-1.3 2.53 0 3 1.67 3 3.84V18h-2.47v-3.96c0-.95-.01-2.16-1.32-2.16-1.32 0-1.52 1.03-1.52 2.09V18H9.73V9.75Z" />
    </svg>
  );
}

function InstagramLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7.75 3h8.5A4.75 4.75 0 0 1 21 7.75v8.5A4.75 4.75 0 0 1 16.25 21h-8.5A4.75 4.75 0 0 1 3 16.25v-8.5A4.75 4.75 0 0 1 7.75 3Zm0 1.75A3 3 0 0 0 4.75 7.75v8.5a3 3 0 0 0 3 3h8.5a3 3 0 0 0 3-3v-8.5a3 3 0 0 0-3-3h-8.5Zm8.88 1.5a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z" />
    </svg>
  );
}

function YouTubeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.56 7.2a2.73 2.73 0 0 0-1.92-1.92C16.95 4.75 12 4.75 12 4.75s-4.95 0-6.64.53A2.73 2.73 0 0 0 3.44 7.2 28.7 28.7 0 0 0 3 12a28.7 28.7 0 0 0 .44 4.8 2.73 2.73 0 0 0 1.92 1.92c1.69.53 6.64.53 6.64.53s4.95 0 6.64-.53a2.73 2.73 0 0 0 1.92-1.92A28.7 28.7 0 0 0 21 12a28.7 28.7 0 0 0-.44-4.8ZM10.4 15.2V8.8L15.6 12l-5.2 3.2Z" />
    </svg>
  );
}

function FacebookLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.42h2.5l.38-2.9h-2.88V8.83c0-.84.23-1.42 1.44-1.42h1.53V4.82A20.4 20.4 0 0 0 14.23 4c-2.2 0-3.73 1.34-3.73 3.8v2.88H8v2.9h2.5V21h3Z" />
    </svg>
  );
}

type SiteFooterProps = {
  awards: string[];
};

export function SiteFooter({ awards }: SiteFooterProps) {
  const year = new Date().getFullYear();

  const legalLinks = ["Privacy", "Compliance", "Terms", "Cancellation & Refund"];
  const quickLinks = ["Products", "Pricing", "Resources", "Contact"];
  const socialLinks = [
    { name: "LinkedIn", icon: LinkedInLogo },
    { name: "Instagram", icon: InstagramLogo },
    { name: "YouTube", icon: YouTubeLogo },
    { name: "Facebook", icon: FacebookLogo },
  ];

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
            Connect with us: +91 70292 14041 · mukherjeesujit602@gmail.com
          </p>
          <div className="flex items-center gap-2 md:justify-end">
            {socialLinks.map(({ name, icon: Icon }) => (
              <a
                key={name}
                href="#"
                aria-label={`Visit our ${name} page`}
                className="grid size-10 place-items-center rounded-full border border-white/45 bg-white/5 text-xs font-semibold uppercase tracking-wide transition hover:border-white hover:bg-white/12"
              >
                <Icon className="size-4" />
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
