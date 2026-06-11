"use client";

import { useState } from "react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "Do I need to be good with computers?",
    a: "No. If you can fill in a birthday card, you can use this. There's a friendly 3-step setup, then everything has its own button. No manual, no settings to wrestle with.",
  },
  {
    q: "Is it really a one-time payment?",
    a: "Yes. Pay $19 once and it's yours. No subscription, no monthly fee, no surprise charge next year. We'd rather you tell a friend than dread a renewal.",
  },
  {
    q: "Does it work on my phone?",
    a: "It works on your phone, your tablet, and your laptop — and they all stay in sync. Add a vet visit on your laptop tonight; it's on your phone at the clinic tomorrow.",
  },
  {
    q: "I have more than one pet. Is that extra?",
    a: "Add as many as you love — dogs, cats, rabbits, birds — for the same one price. Switch between them with a tap.",
  },
  {
    q: "Who can see my pet's information?",
    a: "Only you. It lives in your private account behind your password. We don't sell it, and you can download a full backup of everything any time you want.",
  },
  {
    q: "What if I want to leave?",
    a: "Tap 'Back up my data' and you get a clean copy of everything to keep. Your records are yours — we never hold them hostage.",
  },
  {
    q: "Is this medical advice?",
    a: "No — it's a place to keep your records and reminders organized. Always follow your vet for medical decisions. We just make sure you can find the dates and doses when you need them.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {ITEMS.map((it, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="card"
            style={{
              padding: 0,
              marginBottom: 12,
              overflow: "hidden",
              borderColor: isOpen ? "var(--forest)" : "var(--line)",
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: "100%",
                textAlign: "left",
                background: "none",
                border: "none",
                cursor: "pointer",
                font: "inherit",
                fontWeight: 600,
                fontSize: "1.02rem",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                color: "var(--charcoal)",
              }}
            >
              {it.q}
              <span
                style={{
                  color: "var(--terracotta)",
                  fontSize: "1.4rem",
                  lineHeight: 1,
                  transform: isOpen ? "rotate(45deg)" : "none",
                  transition: "transform 0.2s ease",
                  flexShrink: 0,
                }}
              >
                +
              </span>
            </button>
            <div
              style={{
                maxHeight: isOpen ? 320 : 0,
                opacity: isOpen ? 1 : 0,
                transition: "max-height 0.3s ease, opacity 0.25s ease",
                overflow: "hidden",
              }}
            >
              <p
                className="muted"
                style={{ padding: "0 20px 18px", margin: 0, lineHeight: 1.6 }}
              >
                {it.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
