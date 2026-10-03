import { lazy, Suspense, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, fmt } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Button, buttonClass, Card } from "@/components/senda/ui";

const UssdSimulator = lazy(() => import("@/components/senda/ussd").then((m) => ({ default: m.UssdSimulator })));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Senda — Send money home. Simply." },
      { name: "description", content: "Know what you pay. Know what your family gets. Clear fees across Africa." },
      { property: "og:title", content: "Senda — Send money home. Simply." },
      { property: "og:description", content: "One transfer. Two people. Zero uncertainty." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

// Example shown on the home card; the numbers come from the backend quote.
const EXAMPLE = { amount: 1000, currency: "ZWG", flag: "🇿🇼" };

function Home() {
  const { t } = useI18n();
  const { data, isError } = useQuery({
    queryKey: ["rate", EXAMPLE.currency, EXAMPLE.amount],
    queryFn: () => api.rate(EXAMPLE.currency, EXAMPLE.amount),
  });
  const q = data?.quote;
  const [ussd, setUssd] = useState(false);
  const features = [
    { icon: "➜", title: t("f_send"), d: t("f_sendD") },
    { icon: "👁", title: t("f_know"), d: t("f_knowD") },
    { icon: "🤲", title: t("f_receive"), d: t("f_receiveD") },
    { icon: "📍", title: t("f_track"), d: t("f_trackD") },
  ];

  return (
    <div className="home-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="hero-eyebrow"><span aria-hidden className="hero-eyebrow-dot" /> {t("sendAcross")}</p>
          <h1>
            {t("heroA")}
            <br />
            <span>{t("heroB")}</span>
          </h1>
          <p className="hero-lead">{t("homeLead")}</p>
          <div className="hero-actions">
            <Link to="/send" className={buttonClass("primary", "hero-cta hero-cta-primary")}>
              {t("sendMoney")} <span aria-hidden>→</span>
            </Link>
            <Link to="/track" className={buttonClass("secondary", "hero-cta hero-cta-secondary")}>
              <span className="track-icon" aria-hidden>⌖</span> {t("trackTransfer")}
            </Link>
          </div>
          <div className="hero-proof">
            <span className="proof-avatars" aria-hidden><i>T</i><i>M</i><i>+</i></span>
            <span><strong>Made for your people</strong><small>Every transfer, a little closer to home</small></span>
          </div>
        </div>

        <Card className="quote-card">
          <div className="quote-heading">
            <span className="quote-icon" aria-hidden>↗</span>
            <div>
              <p className="quote-kicker">YOUR TRANSFER</p>
              <h2>A clear rate. No surprises.</h2>
            </div>
            <span className="live-pill"><i /> LIVE</span>
          </div>
          <div className="quote-amount">
            <div>
              <p>{t("youPay")}</p>
              <strong>{q ? `R${fmt(q.total, 0)}` : "—"}</strong>
              {q && <small>R{fmt(q.amount, 0)} {t("sentWord")} · R{fmt(q.fee, 0)} {t("feeWord")}</small>}
            </div>
            <span className="quote-arrow" aria-hidden>↓</span>
            <div className="receive-amount">
              <p>{t("familyReceives")}</p>
              <strong>{q ? fmt(q.receiveAmount) : "—"} <span>{q?.receiveCurrency}</span> <i aria-hidden>{EXAMPLE.flag}</i></strong>
              <small>Direct to your loved ones</small>
            </div>
          </div>
          <div className="quote-foot">
            <span><b aria-hidden>✓</b> {t("rateLocked")}</span>
            <span><b aria-hidden>✓</b> {t("noHidden")}</span>
          </div>
          {isError && <p className="quote-error">{t("errApi")}</p>}
        </Card>
        <span className="hero-orb hero-orb-one" aria-hidden />
        <span className="hero-orb hero-orb-two" aria-hidden />
      </section>

      <section id="why-senda" aria-labelledby="families" className="features-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">MORE THAN A TRANSFER</p>
            <h2 id="families">{t("madeFor")}</h2>
          </div>
          <p>Simple, secure ways to show up for the people you love.</p>
        </div>
        <ol className="feature-grid">
          {features.map((f, i) => (
            <li key={f.title} className="feature-card">
              <span aria-hidden className="feature-icon lite:hidden">
                {f.icon}
              </span>
              <span className="feature-number">0{i + 1}</span>
              <p className="feature-title">{f.title}</p>
              <p className="feature-description">{f.d}</p>
              <span className="feature-arrow" aria-hidden>↗</span>
            </li>
          ))}
        </ol>
      </section>

      <Card className="ussd-card">
        <div className="ussd-symbol" aria-hidden>⌘</div>
        <div className="ussd-copy">
          <p className="section-kicker">NO SMARTPHONE? NO PROBLEM.</p>
          <h2>Stay connected, anywhere.</h2>
          <p>Send money with a simple USSD menu, even without data.</p>
        </div>
        <Button variant="secondary" className="ussd-button" onClick={() => setUssd(true)}>
          Open USSD demo <span aria-hidden>→</span>
        </Button>
      </Card>
      {ussd && (
        <Suspense fallback={null}>
          <UssdSimulator onClose={() => setUssd(false)} />
        </Suspense>
      )}

      <p className="support-note">{t("support")}</p>
    </div>
  );
}
