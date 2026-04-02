import { ContactSection } from "@/components/ContactSection";
import { EcosystemSection } from "@/components/EcosystemSection";
import { HeroSection } from "@/components/HeroSection";
import { ModuleSection } from "@/components/ModuleSection";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustSection } from "@/components/TrustSection";
import { WhySection } from "@/components/WhySection";

export default function Home() {
  const navItems = ["Products", "About Us", "Careers"];
  const featureTabs = ["POS", "Payroll", "Invoice", "Purchase", "Tasks"];
  const trustedBrands = [
    "Jumboking",
    "Vasanta Bhavan",
    "Moti Mahal",
    "Rbb",
    "Nandhana",
    "Mr Sandwich",
    "Haldiram",
    "Zepto",
  ];
  const whyCards = [
    {
      title: "Continuous Innovation",
      text: "We continuously research and develop our solutions and provide regular updates with new features to improve performance.",
    },
    {
      title: "Pricing",
      text: "Industry-low, transparent pricing models designed to scale your business.",
    },
    {
      title: "Simplicity",
      text: "User-centric design with creative interfaces to help you quickly learn and leverage the full potential of our solutions.",
    },
    {
      title: "24x7 Support",
      text: "Our dedicated support team is always ready to help you and keep your operations running smoothly.",
    },
  ];
  const awards = [
    "High Performer",
    "Best Support",
    "Leader",
    "Easiest To Do Business With",
    "Users Love Us",
    "Momentum Leader",
    "Grid Leader",
  ];

  return (
    <>
      <Navbar navItems={navItems} />
      <div className="bg-[#f4f5f7] text-[#1f2027]">
        <main>
          <HeroSection />
          <ModuleSection featureTabs={featureTabs} />
          <TrustSection trustedBrands={trustedBrands} />
          <WhySection whyCards={whyCards} />
          <EcosystemSection />
          <ContactSection />
        </main>

        <SiteFooter awards={awards} />
      </div>
    </>
  );
}
