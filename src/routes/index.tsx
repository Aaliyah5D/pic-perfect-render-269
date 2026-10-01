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
    <div className="flex flex-col gap-8 pt-4">
      <section className="space-y-4">
        <p className="inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold">{t("sendAcross")}</p>
        <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight">
          {t("heroA")}
          <br />
          <span className="text-accent lite:text-foreground">{t("heroB")}</span>
        </h1>
        <p className="text-lg text-muted-foreground">{t("homeLead")}</p>
      </section>

      <div className="space-y-3">
        <Link to="/send" className={buttonClass("primary")}>
          {t("sendMoney")} →
        </Link>
        <Link to="/track" className={buttonClass("secondary")}>
          {t("trackTransfer")}
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="space-y-1 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">{t("youPay")}</p>
          <p className="tabular text-4xl font-extrabold tracking-tight">{q ? `R${fmt(q.total, 0)}` : "—"}</p>
          {q && (
            <p className="tabular text-muted-foreground">
              R{fmt(q.amount, 0)} {t("sentWord")} · R{fmt(q.fee, 0)} {t("feeWord")}
            </p>
          )}
          {isError && <p className="text-sm text-destructive">{t("errApi")}</p>}
        </div>
        <div className="relative h-0 border-t-2 border-dashed border-border">
          <span aria-hidden className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
            ↓
          </span>
        </div>
        <div className="space-y-1 bg-success-soft p-5 pt-7">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-success">{t("familyReceives")}</p>
          <p className="tabular text-4xl font-extrabold tracking-tight">
            {q ? fmt(q.receiveAmount) : "—"} <span className="text-xl">{q?.receiveCurrency}</span>{" "}
            <span aria-hidden className="text-2xl">{EXAMPLE.flag}</span>
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm font-semibold text-success">
            <span>✓ {t("rateLocked")}</span>
            <span>✓ {t("noHidden")}</span>
          </div>
        </div>
      </Card>

      <section aria-labelledby="families" className="space-y-3">
        <h2 id="families" className="text-2xl font-extrabold tracking-tight">
          {t("madeFor")}
        </h2>
        <ol className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <li key={f.title} className="rounded-2xl bg-card p-4">
              <span aria-hidden className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-secondary text-lg lite:hidden">
                {f.icon}
              </span>
              <p className="font-bold">
                {i + 1}. {f.title}
              </p>
              <p className="text-sm text-muted-foreground">{f.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <Card className="space-y-3 border-2 border-dashed border-input">
        <p className="text-sm font-semibold text-muted-foreground">📱 No smartphone or data?</p>
        <p className="text-2xl font-extrabold tracking-tight">Try Senda USSD</p>
        <Button variant="secondary" onClick={() => setUssd(true)}>
          Open USSD Demo
        </Button>
      </Card>
      {ussd && (
        <Suspense fallback={null}>
          <UssdSimulator onClose={() => setUssd(false)} />
        </Suspense>
      )}

      <p className="text-center text-sm font-medium text-muted-foreground">{t("support")}</p>
    </div>
  );
}
