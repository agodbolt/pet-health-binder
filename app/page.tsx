import Link from "next/link";
import { Paw } from "@/components/PawMotif";
import { BuyButton } from "@/components/BuyButton";
import { Reveal } from "@/components/landing/Reveal";
import { Faq } from "@/components/landing/Faq";
import { TrackViewContent } from "@/components/landing/TrackViewContent";
import { Sparkline } from "@/components/Sparkline";

export default function LandingPage() {
  return (
    <main>
      <TrackViewContent />
      <Nav />
      <Hero />
      <BreedMarquee />
      <Problem />
      <Scenarios />
      <Solution />
      <CompleteRecord />
      <Features />
      <PeekInside />
      <SitterSpotlight />
      <SystemsFail />
      <Comparison />
      <FitOrNot />
      <Testimonials />
      <Founder />
      <Pricing />
      <FaqSection />
      <FinalCta />
      <Footer />
    </main>
  );
}

/* ------------------------------------------------------------------ nav */
function Nav() {
  return (
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
          <span style={{ fontFamily: "var(--font-head)", fontSize: "1.2rem" }}>
            Pet Health Binder
          </span>
        </Link>
        <nav className="row gap-2">
          <Link href="#how" className="muted hide-sm" style={{ fontWeight: 500 }}>
            How it works
          </Link>
          <Link href="#pricing" className="muted hide-sm" style={{ fontWeight: 500 }}>
            Pricing
          </Link>
          <Link href="/login" style={{ fontWeight: 550 }}>
            Log in
          </Link>
          <BuyButton className="btn btn-sm">Get the binder</BuyButton>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ hero */
function Hero() {
  return (
    <section className="container" style={{ padding: "72px 24px 36px" }}>
      <div className="hero-grid">
        <div>
          <span className="eyebrow fadeup">For people whose pets are family</span>
          <h1
            className="fadeup"
            style={{
              fontSize: "clamp(2.2rem, 4.6vw, 3.5rem)",
              margin: "14px 0 18px",
              lineHeight: 1.04,
              animationDelay: "60ms",
            }}
          >
            It&apos;s 2am at the emergency vet. They ask what meds he&apos;s on
            and when his last shot was. Do you&nbsp;know?
          </h1>
          <p
            className="fadeup"
            style={{
              fontSize: "1.18rem",
              color: "var(--ink-soft)",
              maxWidth: 540,
              animationDelay: "120ms",
            }}
          >
            For most of us the honest answer is &ldquo;uhh… let me think.&rdquo;
            The rabies date is on a card somewhere. The pills are in your head.
            The vet&apos;s number is buried in your phone. Pet Health Binder puts
            every bit of it in one calm place, and it&apos;s right there in your
            pocket the second someone asks.
          </p>
          <div
            className="row gap-2 wrap fadeup"
            style={{ marginTop: 10, animationDelay: "180ms" }}
          >
            <BuyButton className="btn btn-accent">
              Get my binder for $19
            </BuyButton>
            <Link href="/login" className="btn btn-ghost">
              I already have one
            </Link>
          </div>
          <p
            className="faint fadeup"
            style={{ fontSize: "0.85rem", marginTop: 14, animationDelay: "240ms" }}
          >
            One payment. No subscription. Works on your phone, tablet &amp; laptop.
          </p>
        </div>

        <div style={{ position: "relative" }} className="fadeup">
          <div
            className="card card-pad-lg floaty"
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
            <AlertRow tone="red" title="❌ Rabies · 12 days overdue" sub="Maple Street Animal Hospital" />
            <AlertRow tone="amber" title="⚠️ Apoquel refill · due in 9 days" sub="16mg · twice daily" />
            <AlertRow tone="green" title="✅ Bordetella · current" sub="Good through next spring" />
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
  );
}

function AlertRow({
  tone,
  title,
  sub,
}: {
  tone: "red" | "amber" | "green";
  title: string;
  sub: string;
}) {
  const bg =
    tone === "red"
      ? "var(--red-soft)"
      : tone === "amber"
        ? "var(--amber-soft)"
        : "var(--forest-soft)";
  const color =
    tone === "red"
      ? "var(--red)"
      : tone === "amber"
        ? "var(--amber)"
        : "var(--green-ok)";
  return (
    <div style={{ background: bg, borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
      <strong style={{ color }}>{title}</strong>
      <div className="muted" style={{ fontSize: "0.85rem" }}>
        {sub}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ breed marquee */
function BreedMarquee() {
  const breeds = [
    "Golden Retrievers", "tabby cats", "doodles", "rescue mutts", "senior dogs",
    "brand-new puppies", "three-cat households", "house rabbits", "tuxedo cats",
    "German Shepherds", "indoor budgies", "anxious chihuahuas", "farm dogs",
  ];
  const loop = [...breeds, ...breeds];
  return (
    <section
      style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--paper)", padding: "14px 0" }}
    >
      <div className="container" style={{ marginBottom: 8 }}>
        <p className="faint center" style={{ margin: 0, fontSize: "0.82rem" }}>
          Built for the people who keep the vet&apos;s number memorized
        </p>
      </div>
      <div className="marquee">
        <div className="marquee__track">
          {loop.map((b, i) => (
            <span key={i} className="chip chip-neutral" style={{ fontSize: "0.85rem" }}>
              <Paw size={13} color="var(--terracotta)" /> {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- problem */
function Problem() {
  return (
    <section className="container" style={{ padding: "72px 24px 24px", maxWidth: 760 }}>
      <Reveal>
        <span className="eyebrow">Be honest for a second</span>
        <h2 style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.3rem)", margin: "10px 0 16px" }}>
          Your pet&apos;s whole history is scattered across six places, and
          most of those places are inside your head.
        </h2>
      </Reveal>
      <Reveal delay={80}>
        <p style={{ fontSize: "1.1rem", color: "var(--ink-soft)" }}>
          The last rabies shot? On a paper somewhere, you think. The pills he
          takes? You know the names… roughly. When the next flea treatment is
          due? You&apos;ll &ldquo;remember.&rdquo; The vet&apos;s number, the
          microchip number, what the vet said at the last visit. Scattered, or
          gone.
        </p>
      </Reveal>
      <Reveal delay={140}>
        <p style={{ fontSize: "1.1rem", color: "var(--ink-soft)" }}>
          And it&apos;s all fine. Right up until the one day it isn&apos;t.
          Somebody needs a real answer, fast, and &ldquo;I&apos;ll
          remember&rdquo; turns out to be the worst filing system you ever
          trusted.
        </p>
      </Reveal>
      <Reveal delay={200}>
        <div
          className="card"
          style={{ marginTop: 22, background: "var(--cream)" }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Here&apos;s what the scattered version costs, sooner or later:
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
            {[
              "A vaccine record you can&apos;t produce at the boarding desk",
              "A missed dose nobody noticed until the itching came back",
              "Retyping the same instructions for every sitter, every trip",
              "Digging through two years of email while the vet waits",
              "A partner or kid who has no idea what he takes or who to call",
              "Guessing, out loud, at the emergency clinic",
            ].map((t) => (
              <li key={t} className="row gap-1" style={{ alignItems: "flex-start" }}>
                <span style={{ color: "var(--red)" }}>✕</span>
                <span className="muted" dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

/* -------------------------------------------------------------- scenarios */
function Scenarios() {
  const items = [
    {
      emoji: "🚨",
      title: "The 2am emergency",
      body: "He&apos;s shaking and you&apos;re terrified. The vet asks one simple question. What is he on, and what&apos;s he allergic to? Every second you spend guessing is a second they can&apos;t treat him.",
    },
    {
      emoji: "🧳",
      title: "The boarding desk",
      body: "You&apos;re dropping her off before your flight. &ldquo;We just need her up-to-date vaccine record.&rdquo; You don&apos;t have it. Now you&apos;re on the phone to the clinic with a boarding pass in your teeth.",
    },
    {
      emoji: "📱",
      title: "The sitter text at dinner",
      body: "&ldquo;Hey, how much food does he get? And does he take a pill at night?&rdquo; You&apos;re out at dinner, typing it from memory and hoping you got the dose right.",
    },
  ];
  return (
    <section className="container" style={{ padding: "24px 24px 64px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}
      >
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 90}>
            <div className="card lift" style={{ height: "100%" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{it.emoji}</div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: 8 }}>{it.title}</h3>
              <p
                className="muted"
                style={{ margin: 0, fontSize: "0.97rem" }}
                dangerouslySetInnerHTML={{ __html: it.body }}
              />
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <div className="center" style={{ marginTop: 34 }}>
          <p className="muted" style={{ marginBottom: 12 }}>
            And all the smaller moments in between:
          </p>
          <div className="row gap-1 wrap" style={{ justifyContent: "center" }}>
            {[
              "Before boarding",
              "Before travel",
              "At the emergency vet",
              "Switching vets",
              "Handing off to a sitter",
              "When meds change",
              "At the groomer",
              "New puppy paperwork",
            ].map((m) => (
              <span key={m} className="chip chip-neutral" style={{ fontSize: "0.85rem" }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------------------------------------- solution */
function Solution() {
  return (
    <section id="how" style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="container center" style={{ padding: "72px 24px", maxWidth: 760 }}>
        <Reveal>
          <span className="eyebrow">Here&apos;s the fix</span>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.5rem)", margin: "12px 0 16px" }}>
            One calm place for everything. In your pocket. Always up to date.
          </h2>
          <p style={{ fontSize: "1.12rem", color: "var(--ink-soft)" }}>
            You spend ten quiet minutes once putting it all in: the shots, the
            pills, the vet, the quirks. After that, the binder does the
            remembering. It tells you what&apos;s overdue and what&apos;s coming
            up, and it hands you the answer the moment anyone asks, whether
            that&apos;s the clinic, the boarding desk, or your own front door.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------- complete record */
function CompleteRecord() {
  const items = [
    ["💉", "Vaccinations & due dates"],
    ["💊", "Medications & dosing instructions"],
    ["🩺", "Vet visit history & diagnoses"],
    ["📅", "Follow-up reminders"],
    ["⚖️", "Weight history & trend"],
    ["🛁", "Grooming & recurring care schedule"],
    ["🧾", "Vet costs & spending by category"],
    ["🔖", "Microchip number"],
    ["📇", "Vet & emergency vet contacts"],
    ["🍽️", "Feeding & daily routine"],
    ["💭", "Quirks & behavior notes"],
    ["🖨️", "Printable vaccine record"],
    ["📋", "Printable sitter sheet"],
    ["💾", "A full backup you can download"],
  ];
  return (
    <section className="container" style={{ padding: "72px 24px 24px" }}>
      <Reveal>
        <div className="center" style={{ marginBottom: 36 }}>
          <span className="eyebrow">Not a notes app</span>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.3rem)", margin: "10px 0 8px" }}>
            Your pet&apos;s complete life record
          </h2>
          <p className="muted" style={{ maxWidth: 560, margin: "0 auto" }}>
            Fourteen kinds of information a pet accumulates over a lifetime,
            kept in one place that&apos;s always with you.
          </p>
        </div>
      </Reveal>
      <Reveal delay={80}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 12,
          }}
        >
          {items.map(([icon, label]) => (
            <div
              key={label}
              className="row gap-1"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: "10px 14px",
              }}
            >
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: "0.92rem", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------------------------------------- features */
function Features() {
  const rows = [
    {
      emoji: "💉",
      title: "Vaccines that never quietly lapse",
      body: "Every shot with the date it was given and the day it&apos;s due, plus a clear current / due-soon / overdue badge. When the groomer or boarder asks for proof, print a clean one-page record in a tap instead of begging the clinic to fax it.",
    },
    {
      emoji: "💊",
      title: "Meds you actually keep up with",
      body: "Doses, refill dates, and a dead-simple daily checklist so you never stand there wondering if he had his morning pill. It even keeps a little streak going, which is oddly satisfying when you&apos;re caring for a sick pet.",
    },
    {
      emoji: "🩺",
      title: "The whole vet story, remembered",
      body: "Reason, diagnosis, treatment, cost, and the follow-up date for every visit. So the next vet (or the next you, a year from now) has the full picture instead of a foggy guess.",
    },
    {
      emoji: "⚖️",
      title: "Weight you can finally see",
      body: "A gentle line over time with notes like &lsquo;new food&rsquo; or &lsquo;post-surgery.&rsquo; The slow creep that&apos;s hard to notice day to day becomes obvious early, while it&apos;s still easy to fix.",
    },
    {
      emoji: "🛁",
      title: "Grooming & care that nudge you",
      body: "Nail trims, baths, flea and tick, heartworm, all set to repeat on your schedule. One tap marks it done and sets the next. No more &lsquo;wait, when did we last…?&rsquo;",
    },
  ];
  return (
    <section className="container" style={{ padding: "72px 24px 40px" }}>
      <Reveal>
        <div className="center" style={{ marginBottom: 48 }}>
          <span className="eyebrow">What&apos;s inside</span>
          <h2 style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.3rem)", margin: "10px 0" }}>
            Six things off your mind and into one tidy binder
          </h2>
        </div>
      </Reveal>
      <div className="stack" style={{ gap: 18 }}>
        {rows.map((r, i) => (
          <Reveal key={r.title} delay={i * 60}>
            <div
              className="card lift two-col"
              style={{ gap: 24, alignItems: "center", padding: 26 }}
            >
              <div
                style={{
                  fontSize: 50,
                  textAlign: "center",
                  background: "var(--cream)",
                  borderRadius: 18,
                  padding: "22px 0",
                }}
              >
                {r.emoji}
              </div>
              <div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: 8 }}>{r.title}</h3>
                <p
                  className="muted"
                  style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: r.body }}
                />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ peek inside */
function PeekInside() {
  return (
    <section style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="container" style={{ padding: "72px 24px" }}>
        <Reveal>
          <div className="center" style={{ marginBottom: 40 }}>
            <span className="eyebrow">A peek inside</span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.3rem)", margin: "10px 0 8px" }}>
              This is what &ldquo;ready&rdquo; looks like
            </h2>
            <p className="muted">Three of the binder&apos;s screens, doing their job.</p>
          </div>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* vaccine status */}
          <Reveal>
            <div className="card lift">
              <div className="eyebrow" style={{ marginBottom: 12 }}>Vaccines</div>
              {[
                ["Bordetella", "chip-ok", "✅ Current"],
                ["DHPP", "chip-amber", "⚠️ Due in 21d"],
                ["Rabies", "chip-red", "❌ Overdue 12d"],
              ].map(([name, cls, label]) => (
                <div
                  key={name}
                  className="row"
                  style={{ justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--line)" }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{name}</span>
                  <span className={`chip ${cls}`}>{label}</span>
                </div>
              ))}
              <p className="faint" style={{ margin: "12px 0 0", fontSize: "0.82rem" }}>
                It flags what&apos;s due before it lapses.
              </p>
            </div>
          </Reveal>
          {/* today's doses */}
          <Reveal delay={80}>
            <div className="card lift">
              <div className="eyebrow" style={{ marginBottom: 12 }}>Today&apos;s doses</div>
              <div style={{ background: "var(--cream)", borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                  Apoquel <span className="faint" style={{ fontWeight: 400 }}>· 16 mg · twice daily</span>
                </div>
                <div className="faint" style={{ fontSize: "0.8rem", margin: "2px 0 8px" }}>🔥 12-day streak</div>
                <div className="row gap-1">
                  <span className="chip chip-ok">✓ Morning</span>
                  <span className="chip chip-neutral">○ Evening</span>
                </div>
              </div>
              <p className="faint" style={{ margin: 0, fontSize: "0.82rem" }}>
                Tap as you give it. Resets every morning.
              </p>
            </div>
          </Reveal>
          {/* weight trend */}
          <Reveal delay={160}>
            <div className="card lift">
              <div className="eyebrow" style={{ marginBottom: 12 }}>Weight trend</div>
              <div className="center" style={{ padding: "8px 0 4px" }}>
                <Sparkline values={[64.2, 65.0, 66.1, 65.4, 66.8, 67.3]} width={220} height={64} />
                <div className="row" style={{ justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span className="faint">Aug</span>
                  <span style={{ fontWeight: 600 }}>67.3 lb</span>
                </div>
              </div>
              <p className="faint" style={{ margin: "10px 0 0", fontSize: "0.82rem" }}>
                The slow creep becomes visible early.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- sitter sheet */
function SitterSpotlight() {
  return (
    <section style={{ background: "var(--forest)", color: "#fff" }}>
      <div className="container two-col" style={{ padding: "76px 24px" }}>
        <Reveal>
          <span className="eyebrow" style={{ color: "var(--terracotta-soft)" }}>
            The part people fall in love with
          </span>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)", margin: "12px 0 16px" }}>
            Going away? Hand your sitter one page that thinks of everything.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.08rem" }}>
            Feeding times. The pills explained in plain words, so instead of
            &ldquo;16mg BID&rdquo; it reads &ldquo;half a tablet hidden in a
            treat, morning and night.&rdquo; The walk routine. The &ldquo;hides
            during storms&rdquo; quirks. Your number, the vet, the emergency vet,
            the microchip. It fills itself in from what&apos;s already in your
            binder, then prints into one calm sheet with your pet&apos;s photo on
            top.
          </p>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.08rem" }}>
            Leave it on the counter and actually relax on your trip.
          </p>
          <div style={{ marginTop: 8 }}>
            <BuyButton className="btn btn-accent">Make my sitter sheet</BuyButton>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="card" style={{ color: "var(--charcoal)", padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--cream)", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
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
              <SitterRow label="Food" value="½ cup Hill's, twice daily (8am and 7pm)" />
              <SitterRow label="Meds" value="Half a thyroid tablet in a treat, every morning" />
              <SitterRow label="Litter" value="Scoop daily; she likes it very clean" />
              <SitterRow label="Good to know" value="Hides under the bed in storms, so just let her be" />
              <SitterRow label="Emergency vet" value="Riverside 24hr · (555) 911-0000" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
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

/* ------------------------------------------------------------ systems fail */
function SystemsFail() {
  const systems = [
    ["📧", "Email", "Search &lsquo;rabies,&rsquo; scroll, squint, give up, call the clinic."],
    ["📷", "The camera roll", "A photo of a vaccine card from two phones ago, somewhere between 9,000 screenshots."],
    ["🗒️", "Sticky notes", "Gone by the time the sitter arrives. Nobody knows what &lsquo;1/2 pill PM&rsquo; meant anyway."],
    ["🧠", "Memory", "The worst filing cabinet ever invented, and the only one you can&apos;t hand to someone else."],
    ["📁", "The folder", "Sitting at home, being very organized, while you stand at the emergency clinic."],
  ];
  return (
    <section className="container" style={{ padding: "64px 24px 8px", maxWidth: 820 }}>
      <Reveal>
        <div className="center" style={{ marginBottom: 30 }}>
          <span className="eyebrow">The uncomfortable part</span>
          <h2 style={{ fontSize: "clamp(1.7rem, 3vw, 2.2rem)", margin: "10px 0" }}>
            You already have a system. That&apos;s the problem.
          </h2>
        </div>
      </Reveal>
      <div className="stack" style={{ gap: 10 }}>
        {systems.map(([icon, name, why], i) => (
          <Reveal key={name} delay={i * 60}>
            <div
              className="row gap-2"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "12px 16px",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <strong>{name}</strong>{" "}
                <span
                  className="muted"
                  dangerouslySetInnerHTML={{ __html: why }}
                />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
        <p className="center muted" style={{ marginTop: 22, fontSize: "1.05rem" }}>
          None of them tap you on the shoulder before a shot lapses or a refill
          runs out. The binder does.
        </p>
      </Reveal>
    </section>
  );
}

/* -------------------------------------------------------------- comparison */
function Comparison() {
  const before = [
    "Vaccine dates on a paper… somewhere",
    "Pills remembered &lsquo;roughly&rsquo;",
    "Vet bills stuffed in a drawer",
    "Sitter instructions typed from memory",
    "&lsquo;When was the last flea treatment?&rsquo; Who knows",
    "Each pet&apos;s history in a different place",
  ];
  const after = [
    "Every shot dated, with a due-date badge",
    "A daily checklist that resets each morning",
    "Costs logged and totalled for you",
    "A printable sitter sheet that fills itself in",
    "It tells you what&apos;s due before it&apos;s late",
    "Every pet in one place, a tap apart",
  ];
  return (
    <section className="container" style={{ padding: "72px 24px", maxWidth: 920 }}>
      <Reveal>
        <h2 className="center" style={{ fontSize: "clamp(1.7rem, 3vw, 2.2rem)", marginBottom: 36 }}>
          The junk drawer vs. your binder
        </h2>
      </Reveal>
      <div className="two-col" style={{ gap: 20, alignItems: "stretch" }}>
        <Reveal>
          <div className="card" style={{ height: "100%", background: "var(--cream)" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--ink-soft)", marginBottom: 14 }}>
              😮‍💨 The way it is now
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              {before.map((t) => (
                <li key={t} className="row gap-1" style={{ alignItems: "flex-start" }}>
                  <span style={{ color: "var(--ink-faint)" }}>✕</span>
                  <span className="muted" dangerouslySetInnerHTML={{ __html: t }} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="card lift" style={{ height: "100%", borderColor: "var(--forest)", boxShadow: "var(--shadow)" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--forest)", marginBottom: 14 }}>
              🌿 With Pet Health Binder
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              {after.map((t) => (
                <li key={t} className="row gap-1" style={{ alignItems: "flex-start" }}>
                  <span style={{ color: "var(--green-ok)" }}>✓</span>
                  <span dangerouslySetInnerHTML={{ __html: t }} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- fit or not */
function FitOrNot() {
  return (
    <section style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="container two-col" style={{ padding: "64px 24px", maxWidth: 880 }}>
        <Reveal>
          <h3 style={{ fontSize: "1.3rem", marginBottom: 14 }}>This is for you if…</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {[
              "New puppy or kitten owners, before the paperwork pile starts",
              "Senior pets, where the history actually matters",
              "Pets on ongoing medications",
              "Multi-pet households with more than one schedule to track",
              "Frequent travelers, boarders, and anyone with a sitter or walker",
              "Anyone who&apos;d feel awful fumbling for answers in an emergency",
            ].map((t) => (
              <li key={t} className="row gap-1" style={{ alignItems: "flex-start" }}>
                <span style={{ color: "var(--green-ok)" }}>✓</span>
                <span dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={100}>
          <h3 style={{ fontSize: "1.3rem", marginBottom: 14 }}>It&apos;s probably not for you if…</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
            {[
              "You genuinely keep perfect paper records and never misplace them",
              "You want a social network for pets (this is a quiet, private binder)",
              "You&apos;d rather keep trusting your memory and hope for the best",
            ].map((t) => (
              <li key={t} className="row gap-1" style={{ alignItems: "flex-start" }}>
                <span style={{ color: "var(--ink-faint)" }}>✕</span>
                <span className="muted" dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ testimonials */
function Testimonials() {
  // NOTE TO OWNER: replace these with real customer reviews before advertising.
  const quotes = [
    {
      q: "I set up my two cats in about ten minutes. Last week the e-vet asked what Mochi was allergic to and I just… read it off my phone. That alone was worth it.",
      who: "Dana R., two-cat household",
    },
    {
      q: "The boarding place always wants the vaccine record and I always panic. Now I print one page and I&apos;m done. My dog-sitter said the care sheet was the clearest she&apos;s ever gotten.",
      who: "Marcus T., Labrador dad",
    },
    {
      q: "My senior dog has four meds and a weight we&apos;re watching. Seeing it all on one screen, and getting nudged before a refill runs out, took a real weight off my chest.",
      who: "Priya S., one very spoiled beagle",
    },
  ];
  return (
    <section className="container" style={{ padding: "72px 24px" }}>
      <Reveal>
        <h2 className="center" style={{ fontSize: "clamp(1.7rem, 3vw, 2.2rem)", marginBottom: 36 }}>
          From people who stopped relying on memory
        </h2>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {quotes.map((t, i) => (
          <Reveal key={i} delay={i * 80}>
            <figure className="card lift" style={{ height: "100%", margin: 0 }}>
              <div style={{ color: "var(--terracotta)", fontSize: "1.1rem", marginBottom: 8 }}>
                ★★★★★
              </div>
              <blockquote
                style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: `&ldquo;${t.q}&rdquo;` }}
              />
              <figcaption className="faint" style={{ marginTop: 12, fontSize: "0.85rem" }}>
                {t.who}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- founder */
function Founder() {
  // NOTE TO OWNER: personalize this with your real story for maximum trust.
  return (
    <section style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="container" style={{ padding: "64px 24px", maxWidth: 680 }}>
        <Reveal>
          <span className="eyebrow">Why this exists</span>
          <h2 style={{ fontSize: "1.7rem", margin: "10px 0 16px" }}>
            I built this after the worst ten minutes of my year.
          </h2>
          <p style={{ fontSize: "1.08rem", color: "var(--ink-soft)" }}>
            My dog got into something he shouldn&apos;t have, late at night. At
            the emergency vet they asked simple questions. His weight, his meds,
            his last vaccines. I stood there guessing while the clock ran.
            He was fine. I was not. I swore I&apos;d never feel that helpless
            again.
          </p>
          <p style={{ fontSize: "1.08rem", color: "var(--ink-soft)" }}>
            So I made the thing I wished I&apos;d had that night: one calm place
            for everything that matters about the animals we love, that&apos;s
            actually with you when it counts. That&apos;s the whole idea. I hope
            it saves you the ten minutes I&apos;ll never forget.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- pricing */
function Pricing() {
  return (
    <section id="pricing" className="container center" style={{ padding: "76px 24px" }}>
      <Reveal>
        <span className="eyebrow">Simple, fair, yours forever</span>
        <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.3rem)", margin: "10px 0 6px" }}>
          One price. However many pets you love.
        </h2>
        <p className="muted" style={{ marginBottom: 8 }}>
          Less than one bag of the good treats.
        </p>
        <p className="muted" style={{ marginBottom: 28, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          You don&apos;t get to choose when the emergency happens. You do get to
          choose whether you&apos;re ready.
        </p>
      </Reveal>
      <Reveal delay={80}>
        <div className="card card-pad-lg lift" style={{ maxWidth: 430, margin: "0 auto", boxShadow: "var(--shadow-lg)" }}>
          <div className="row" style={{ justifyContent: "center", gap: 6 }}>
            <span style={{ fontSize: "1.4rem", color: "var(--ink-soft)" }}>$</span>
            <span style={{ fontFamily: "var(--font-head)", fontSize: "3.6rem" }}>19</span>
            <span className="muted" style={{ alignSelf: "flex-end", marginBottom: 12 }}>once</span>
          </div>
          <ul style={{ textAlign: "left", listStyle: "none", padding: 0, margin: "18px 0 24px", display: "grid", gap: 11 }}>
            {[
              "Unlimited pets: dogs, cats, rabbits, birds & more",
              "Vaccines, meds, vet visits, weight, grooming & expenses",
              "The auto-filling printable sitter sheet",
              "Overdue & due-soon reminders, done for you",
              "Syncs across your phone, tablet & laptop",
              "Download a full backup any time. Your data is yours",
              "No subscription. No ads. No selling your info.",
            ].map((t) => (
              <li key={t} className="row gap-1" style={{ alignItems: "flex-start" }}>
                <span style={{ color: "var(--green-ok)" }}>✓</span>
                <span style={{ fontSize: "0.96rem" }}>{t}</span>
              </li>
            ))}
          </ul>
          <BuyButton className="btn btn-accent btn-block">Get the binder for $19</BuyButton>
          <p className="faint" style={{ marginTop: 14, fontSize: "0.85rem" }}>
            Try it for 14 days. If it&apos;s not for you, email us for a full
            refund and keep your backup. No hard feelings.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------------------------------------------- faq */
function FaqSection() {
  return (
    <section className="container" style={{ padding: "40px 24px 72px" }}>
      <Reveal>
        <h2 className="center" style={{ fontSize: "clamp(1.7rem, 3vw, 2.2rem)", marginBottom: 32 }}>
          Questions people ask before buying
        </h2>
      </Reveal>
      <Reveal delay={60}>
        <Faq />
      </Reveal>
    </section>
  );
}

/* --------------------------------------------------------------- final cta */
function FinalCta() {
  return (
    <section style={{ background: "var(--forest)", color: "#fff" }}>
      <div className="container center" style={{ padding: "76px 24px", maxWidth: 680 }}>
        <Reveal>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)", marginBottom: 16 }}>
            Don&apos;t wait for the 2am scramble to wish you&apos;d done this.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", marginBottom: 12 }}>
            You&apos;ll spend hundreds of dollars this year on their food, their
            vet, their treats. The last thing you should be doing on the worst
            night of the year is searching for paperwork.
          </p>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", marginBottom: 24 }}>
            Ten quiet minutes today buys you a calm answer on that day. Set up
            your binder once. After that it&apos;s with you, your sitter, and
            your vet, from now on, so you can focus on your pet instead of the
            records.
          </p>
          <BuyButton className="btn btn-accent">Get my binder for $19</BuyButton>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginTop: 14 }}>
            One payment · works on every device · 14-day refund
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ footer */
function Footer() {
  return (
    <footer style={{ background: "var(--paper)" }}>
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
          Made for the people who keep the vet&apos;s number memorized. · Not a
          substitute for veterinary advice.
        </p>
      </div>
    </footer>
  );
}
