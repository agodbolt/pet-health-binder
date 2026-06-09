import Link from "next/link";
import { Paw } from "@/components/PawMotif";

export default function LandingPage() {
  return (
    <main>
      {/* ---- nav ---- */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(250,247,242,0.82)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          className="container row"
          style={{ justifyContent: "space-between", height: 68 }}
        >
          <Link
            href="/"
            className="row gap-1"
            style={{ color: "var(--forest)", fontWeight: 600 }}
          >
            <Paw size={26} color="var(--terracotta)" />
            <span
              style={{ fontFamily: "var(--font-head)", fontSize: "1.2rem" }}
            >
              Pet Health Binder
            </span>
          </Link>
          <nav className="row gap-2">
            <Link
              href="#features"
              className="muted hide-sm"
              style={{ fontWeight: 500 }}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="muted hide-sm"
              style={{ fontWeight: 500 }}
            >
              Pricing
            </Link>
            <Link href="/login" style={{ fontWeight: 550 }}>
              Log in
            </Link>
            <Link href="/signup" className="btn btn-sm">
              Get the binder
            </Link>
          </nav>
        </div>
      </header>

      {/* ---- hero ---- */}
      <section className="container" style={{ padding: "72px 24px 40px" }}>
        <div className="hero-grid">
          <div className="fadeup">
            <span className="eyebrow">For dog &amp; cat people who care</span>
            <h1
              style={{
                fontSize: "clamp(2.2rem, 4.4vw, 3.4rem)",
                margin: "14px 0 18px",
                lineHeight: 1.05,
              }}
            >
              If the emergency vet asked what meds your dog is on — could you
              answer in&nbsp;10&nbsp;seconds?
            </h1>
            <p
              style={{
                fontSize: "1.15rem",
                color: "var(--ink-soft)",
                maxWidth: 520,
              }}
            >
              Vaccine dates live in your head. Meds are on a sticky note. The
              last vet bill is somewhere in a drawer. Pet Health Binder keeps it
              all in one calm place — and it&apos;s right there on your phone
              when someone asks.
            </p>
            <div className="row gap-2 wrap" style={{ margintop: 8 }}>
              <Link href="/signup" className="btn btn-accent">
                Start your binder — $19 once
              </Link>
              <Link href="/login" className="btn btn-ghost">
                I already have one
              </Link>
            </div>
            <p
              className="faint"
              style={{ fontSize: "0.85rem", marginTop: 14 }}
            >
              One-time payment. No subscription. Syncs across your laptop,
              tablet &amp; phone.
            </p>
          </div>

          {/* hero visual: a faux dashboard card */}
          <div className="fadeup" style={{ position: "relative" }}>
            <div
              className="card card-pad-lg"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="row gap-2" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "var(--forest-soft)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 30,
                  }}
                >
                  🐕
                </div>
                <div>
                  <h3 style={{ fontSize: "1.3rem" }}>Cooper</h3>
                  <div className="faint" style={{ fontSize: "0.85rem" }}>
                    Golden Retriever · 3 years, 2 months
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "var(--red-soft)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  marginBottom: 10,
                }}
              >
                <strong style={{ color: "var(--red)" }}>
                  ❌ Rabies — 12 days overdue
                </strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  Maple Street Animal Hospital
                </div>
              </div>
              <div
                style={{
                  background: "var(--amber-soft)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  marginBottom: 10,
                }}
              >
                <strong style={{ color: "var(--amber)" }}>
                  ⚠️ Apoquel refill — due in 9 days
                </strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  16mg · twice daily
                </div>
              </div>
              <div
                style={{
                  background: "var(--forest-soft)",
                  borderRadius: 14,
                  padding: "12px 14px",
                }}
              >
                <strong style={{ color: "var(--green-ok)" }}>
                  ✅ Bordetella — current
                </strong>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  Good through next spring
                </div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -22,
                left: -18,
                background: "var(--terracotta)",
                color: "#fff",
                borderRadius: 999,
                padding: "8px 16px",
                fontWeight: 600,
                fontSize: "0.85rem",
                boxShadow: "var(--shadow)",
                transform: "rotate(-4deg)",
              }}
            >
              Answered in 10 seconds ✓
            </div>
          </div>
        </div>
      </section>

      {/* ---- trust strip ---- */}
      <section
        style={{
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
          background: "var(--paper)",
        }}
      >
        <div
          className="container row wrap gap-3"
          style={{ padding: "20px 24px", justifyContent: "space-between" }}
        >
          {[
            ["🔒", "Your data, your device", "Private to your account"],
            ["📄", "Print for boarding & groomers", "One-tap vaccine record"],
            ["📱", "Laptop, tablet & phone", "Always in sync"],
            ["💾", "Back up any time", "Download your whole binder"],
          ].map(([icon, t, s]) => (
            <div key={t} className="row gap-1" style={{ minWidth: 220 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{t}</div>
                <div className="faint" style={{ fontSize: "0.8rem" }}>
                  {s}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---- features ---- */}
      <section id="features" className="container" style={{ padding: "72px 24px" }}>
        <div className="center" style={{ marginBottom: 48 }}>
          <span className="eyebrow">Everything in one binder</span>
          <h2 style={{ fontSize: "2.2rem", margin: "10px 0" }}>
            The drawer, the sticky notes, and your memory — replaced
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 22,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div style={{ fontSize: 30, marginBottom: 10 }}>{f.emoji}</div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: 6 }}>{f.title}</h3>
              <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- sitter sheet highlight ---- */}
      <section style={{ background: "var(--forest)", color: "#fff" }}>
        <div
          className="container two-col"
          style={{ padding: "72px 24px" }}
        >
          <div>
            <span
              className="eyebrow"
              style={{ color: "var(--terracotta-soft)" }}
            >
              The part people love most
            </span>
            <h2
              style={{
                color: "#fff",
                fontSize: "2.2rem",
                margin: "12px 0 16px",
              }}
            >
              Going away? Hand your sitter a sheet that thinks of everything.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem" }}>
              Feeding times, medication instructions in plain language, the walk
              routine, the &ldquo;hides during storms&rdquo; quirks, your vet,
              the emergency vet, and the microchip number — assembled into one
              calm printable page with your pet&apos;s photo. It fills itself in
              from what&apos;s already in your binder.
            </p>
            <Link
              href="/signup"
              className="btn btn-accent"
              style={{ marginTop: 8 }}
            >
              Make my sitter sheet
            </Link>
          </div>
          <div
            className="card"
            style={{ color: "var(--charcoal)", padding: 0, overflow: "hidden" }}
          >
            <div
              style={{
                background: "var(--cream)",
                padding: "16px 20px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div className="row gap-1">
                <span style={{ fontSize: 24 }}>🐈</span>
                <div>
                  <strong>Caring for Luna</strong>
                  <div className="faint" style={{ fontSize: "0.8rem" }}>
                    While you&apos;re away · prepared June 9
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: 20, fontSize: "0.9rem" }}>
              <SitterRow label="Food" value="½ cup Hill's twice daily, 8am & 7pm" />
              <SitterRow
                label="Meds"
                value="Half a thyroid tablet hidden in a treat, every morning"
              />
              <SitterRow
                label="Litter"
                value="Scoop daily; she likes it very clean"
              />
              <SitterRow
                label="Good to know"
                value="Hides under the bed during storms — let her be"
              />
              <SitterRow label="Emergency vet" value="Riverside 24hr · (555) 911-0000" />
            </div>
          </div>
        </div>
      </section>

      {/* ---- pricing ---- */}
      <section id="pricing" className="container center" style={{ padding: "76px 24px" }}>
        <span className="eyebrow">Simple, fair, yours forever</span>
        <h2 style={{ fontSize: "2.2rem", margin: "10px 0 28px" }}>
          One price. However many pets you love.
        </h2>
        <div
          className="card card-pad-lg"
          style={{ maxWidth: 420, margin: "0 auto", boxShadow: "var(--shadow-lg)" }}
        >
          <div className="row" style={{ justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: "1.4rem", color: "var(--ink-soft)" }}>
              $
            </span>
            <span style={{ fontFamily: "var(--font-head)", fontSize: "3.4rem" }}>
              19
            </span>
            <span
              className="muted"
              style={{ alignSelf: "flex-end", marginBottom: 12 }}
            >
              once
            </span>
          </div>
          <ul
            style={{
              textAlign: "left",
              listStyle: "none",
              padding: 0,
              margin: "18px 0 24px",
              display: "grid",
              gap: 10,
            }}
          >
            {[
              "Unlimited pets — dogs, cats, rabbits, birds & more",
              "Vaccines, meds, vet visits, weight, grooming & expenses",
              "The auto-filling printable sitter sheet",
              "Syncs across all your devices",
              "Back up & restore your data any time",
              "No subscription, ever",
            ].map((t) => (
              <li key={t} className="row gap-1">
                <span style={{ color: "var(--green-ok)" }}>✓</span>
                <span style={{ fontSize: "0.95rem" }}>{t}</span>
              </li>
            ))}
          </ul>
          <Link href="/signup" className="btn btn-accent btn-block">
            Get the binder
          </Link>
        </div>
      </section>

      {/* ---- footer ---- */}
      <footer
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--paper)",
        }}
      >
        <div
          className="container row wrap"
          style={{ justifyContent: "space-between", padding: "28px 24px", gap: 16 }}
        >
          <div className="row gap-1">
            <Paw size={22} color="var(--terracotta)" />
            <span style={{ fontFamily: "var(--font-head)", fontWeight: 600 }}>
              Pet Health Binder
            </span>
          </div>
          <p className="faint" style={{ margin: 0, fontSize: "0.85rem" }}>
            Made for the people who keep the vet&apos;s number memorized. ·
            Not a substitute for veterinary advice.
          </p>
        </div>
      </footer>
    </main>
  );
}

function SitterRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "110px 1fr",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <strong style={{ color: "var(--forest)" }}>{label}</strong>
      <span className="muted">{value}</span>
    </div>
  );
}

const FEATURES = [
  {
    emoji: "💉",
    title: "Vaccines that never lapse",
    body: "Every shot with its due date and a clear current / due-soon / overdue badge. Print a clean record for boarding or the groomer in one tap.",
  },
  {
    emoji: "💊",
    title: "Medications, on schedule",
    body: "Doses, refills and a simple daily checklist so you never wonder whether he had his morning pill. Keep a streak going.",
  },
  {
    emoji: "🩺",
    title: "Every vet visit, remembered",
    body: "Reason, diagnosis, treatment, cost and the follow-up date — logged so the next vet (or the next you) has the full story.",
  },
  {
    emoji: "⚖️",
    title: "Weight you can actually see",
    body: "A gentle line chart over time, with notes like 'new food' or 'post-surgery' so trends mean something.",
  },
  {
    emoji: "🛁",
    title: "Grooming & care reminders",
    body: "Nail trims, baths, flea & tick, heartworm — recurring on your schedule. One tap marks it done and sets the next.",
  },
  {
    emoji: "🧾",
    title: "What your pet really costs",
    body: "Log expenses by category and see month, year and year-over-year totals. Helpful at tax time and budget time.",
  },
];
