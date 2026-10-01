import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, fmt } from "@/lib/api";
import { useFlow } from "@/lib/flow";
import { useI18n } from "@/lib/i18n";
import { Button, buttonClass, Card, ErrorMessage } from "@/components/senda/ui";
import { RecipientPhone, statusLabelKey } from "@/components/senda/money";

export const Route = createFileRoute("/success/$id")({
  head: () => ({
    meta: [
      { title: "Money sent — Senda" },
      { name: "description", content: "Your Senda transfer receipt." },
      { property: "og:title", content: "Money sent — Senda" },
      { property: "og:description", content: "Your transfer is on its way." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const { reset } = useFlow();
  const [copied, setCopied] = useState(false);
  const [showRv, setShowRv] = useState(false);
  const { data: tr, isError, isLoading } = useQuery({ queryKey: ["transfer", id], queryFn: () => api.getTransfer(id) });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">{t("sentTitle")}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t("sentLead")}</p>
      </div>
      {isLoading && <p className="text-center">{t("loading")}</p>}
      {isError && <ErrorMessage>{t("errApi")}</ErrorMessage>}
      {tr && (
        <Card className="animate-rise overflow-hidden p-0">
          <div className="flex items-center justify-between bg-primary px-5 py-4 text-primary-foreground">
            <div>
              <p className="text-sm font-extrabold tracking-[0.2em]">SENDA</p>
              <p className="text-xs uppercase tracking-wider opacity-80">{t("receiptTitle")}</p>
            </div>
            <span className="rounded-full bg-success px-3 py-1 text-sm font-bold text-success-foreground">✓ {t("status_SENT")}</span>
          </div>
          <div className="space-y-1 px-5 pt-5">
            <p className="text-sm font-semibold text-muted-foreground">{t("totalPaid")}</p>
            <p className="tabular text-4xl font-extrabold tracking-tight">R {fmt(tr.quote.total)}</p>
          </div>
          <dl className="divide-y divide-border px-5 py-3">
            <Line k={t("amountSent")} v={`R ${fmt(tr.quote.amount)}`} />
            <Line k={t("familyReceives")} v={`${fmt(tr.quote.receiveAmount)} ${tr.quote.receiveCurrency}`} highlight />
            <Line k={t("fee")} v={`R ${fmt(tr.quote.fee)}`} />
            <Line k={t("rate")} v={`1 ZAR = ${fmt(tr.quote.rate, tr.quote.rate < 10 ? 2 : 1)} ${tr.quote.receiveCurrency}`} />
            <Line k={t("status")} v={t(statusLabelKey(tr.status))} />
          </dl>
          <div className="mx-5 mb-5 rounded-2xl border-2 border-dashed border-input p-4 text-center">
            <p className="text-sm font-semibold text-muted-foreground">{t("reference")}</p>
            <p className="font-mono text-3xl font-extrabold tracking-wider">{tr.id}</p>
            <button
              type="button"
              onClick={copy}
              className="mt-2 min-h-11 rounded-full border-2 border-primary px-4 text-sm font-semibold"
              aria-live="polite"
            >
              {copied ? t("copied") : `⧉ ${t("copyRef")}`}
            </button>
          </div>
        </Card>
      )}
      <div className="space-y-3">
        {tr && (
          <Button variant="accent" onClick={() => setShowRv((v) => !v)} aria-expanded={showRv}>
            📱 {showRv ? t("hideRecipientView") : t("recipientView")}
          </Button>
        )}
        {tr && showRv && <RecipientPhone transfer={tr} />}
        <Link to="/track/$id" params={{ id }} className={buttonClass("primary")}>
          {t("trackMyMoney")} →
        </Link>
        <Link to="/" onClick={reset} className={buttonClass("secondary")}>
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}

function Line({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={highlight ? "tabular text-right text-lg font-extrabold text-success" : "tabular text-right font-semibold"}>{v}</dd>
    </div>
  );
}
