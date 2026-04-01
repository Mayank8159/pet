export default function Home() {
  const navItems = [
    "Products",
    "Solutions",
    "Resources",
    "Pricing",
    "Contact",
  ];

  const trustLogos = [
    "Hocco",
    "Tea Post",
    "Burger Farm",
    "Biryani Hub",
    "Dosa Planet",
    "Cafe Mocha",
  ];

  const features = [
    {
      title: "Point Of Sale",
      description:
        "Fast cloud POS billing with menu controls, combos, KOT and smooth checkout for busy hours.",
      icon: "POS",
    },
    {
      title: "Inventory Control",
      description:
        "Track stock in real time, reduce wastage, automate low-stock alerts and gain purchase visibility.",
      icon: "INV",
    },
    {
      title: "Online Ordering",
      description:
        "Accept direct online orders with your own branded channel and manage aggregators from one panel.",
      icon: "WEB",
    },
    {
      title: "Analytics & Reports",
      description:
        "Measure outlet-level performance with actionable dashboards for sales, staff, and item movement.",
      icon: "REP",
    },
  ];

  const stats = [
    { value: "100,000+", label: "Restaurants Powered" },
    { value: "1.2B+", label: "Orders Processed" },
    { value: "4.8/5", label: "Average Customer Rating" },
    { value: "24x7", label: "Support Availability" },
  ];

  const testimonials = [
    {
      quote:
        "Tabio helped us standardize operations across all outlets. Billing is faster and inventory leakage dropped significantly.",
      person: "Rohan Mehta",
      role: "Director, Spice Trail Restaurants",
    },
    {
      quote:
        "The team onboarding experience was smooth, and the dashboard gives us clarity on every location every day.",
      person: "Priya Shah",
      role: "Owner, Brewleaf Cafe",
    },
  ];

  return (
    <div className="pp-site">
      <header className="pp-header">
        <div className="pp-container pp-header-inner">
          <a href="#" className="pp-logo" aria-label="Tabio home">
            <span className="pp-logo-mark">pp</span>
            <span className="pp-logo-text">Tabio</span>
          </a>
          <nav className="pp-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item} href="#" className="pp-nav-link">
                {item}
              </a>
            ))}
          </nav>
          <div className="pp-header-cta">
            <a href="#" className="pp-btn pp-btn-outline">
              Login
            </a>
            <a href="#" className="pp-btn pp-btn-primary">
              Book Demo
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="pp-hero">
          <div className="pp-container pp-hero-grid">
            <div className="pp-hero-copy">
              <p className="pp-chip">Software for Small and Medium Businesses</p>
              <h1>
                Run your restaurant business on one smart,
                <span> growth-first platform.</span>
              </h1>
              <p>
                Tabio restaurant software built for billing, inventory,
                online orders and analytics. Scale from one outlet to many with
                less manual work.
              </p>
              <div className="pp-hero-actions">
                <a href="#" className="pp-btn pp-btn-primary pp-btn-large">
                  Start Free Demo
                </a>
                <a href="#" className="pp-btn pp-btn-dark pp-btn-large">
                  Watch Product Tour
                </a>
              </div>
            </div>
            <div className="pp-hero-card" aria-hidden="true">
              <div className="pp-kpi-row">
                <div>
                  <p>Today Sales</p>
                  <strong>Rs 3,47,210</strong>
                </div>
                <span>+14.8%</span>
              </div>
              <div className="pp-bars">
                <span style={{ width: "82%" }} />
                <span style={{ width: "61%" }} />
                <span style={{ width: "92%" }} />
                <span style={{ width: "74%" }} />
              </div>
              <div className="pp-kpi-grid">
                <article>
                  <p>Orders</p>
                  <strong>1,284</strong>
                </article>
                <article>
                  <p>Avg Bill</p>
                  <strong>Rs 272</strong>
                </article>
                <article>
                  <p>Wastage</p>
                  <strong>2.1%</strong>
                </article>
                <article>
                  <p>Outlets</p>
                  <strong>06</strong>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="pp-trust">
          <div className="pp-container">
            <p>
              Trusted by 100,000+ restaurants and food businesses across India
            </p>
            <div className="pp-logo-cloud">
              {trustLogos.map((logo) => (
                <span key={logo}>{logo}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="pp-features">
          <div className="pp-container">
            <div className="pp-section-head">
              <h2>Everything you need to operate efficiently</h2>
              <p>
                Inspired by leading restaurant SaaS websites, this page combines the
                core modules that restaurant teams use daily.
              </p>
            </div>
            <div className="pp-feature-grid">
              {features.map((feature) => (
                <article key={feature.title} className="pp-feature-card">
                  <span>{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <a href="#">Learn more</a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pp-stats">
          <div className="pp-container pp-stats-grid">
            {stats.map((stat) => (
              <article key={stat.label}>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pp-testimonials">
          <div className="pp-container">
            <div className="pp-section-head">
              <h2>Built for operators. Loved by teams.</h2>
            </div>
            <div className="pp-testimonial-grid">
              {testimonials.map((item) => (
                <article key={item.person}>
                  <p>"{item.quote}"</p>
                  <h3>{item.person}</h3>
                  <span>{item.role}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pp-cta">
          <div className="pp-container pp-cta-card">
            <h2>Want to simplify your restaurant operations?</h2>
            <p>
              Schedule a live demo and see how your team can manage billing,
              inventory and growth from one dashboard.
            </p>
            <a href="#" className="pp-btn pp-btn-primary pp-btn-large">
              Book Your Free Demo
            </a>
          </div>
        </section>
      </main>

      <footer className="pp-footer">
        <div className="pp-container pp-footer-inner">
          <div>
            <h3>Tabio</h3>
            <p>Made with Next.js in your existing frontend workspace.</p>
          </div>
          <p>2026 Tabio. Built for modern restaurant operations.</p>
        </div>
      </footer>
    </div>
  );
}
