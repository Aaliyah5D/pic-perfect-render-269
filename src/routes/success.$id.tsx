import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, fmt } from "@/lib/api";
import { useFlow } from "@/lib/flow";
import { useI18n } from "@/lib/i18n";
import { buttonClass, Card, ErrorMessage } from "@/components/senda/ui";

export const Route = createFileRoute("/success/$id")({
  head: () => ({
    meta: [
      { title: "Money sent — Senda" },
      { name: "description", content: "Your transfer is on its way." },
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
  const { data: tr, isError } = useQuery({ queryKey: ["transfer", id], queryFn: () => api.getTransfer(id) });

  return (
    <div className="space-y-6 pt-6 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success text-4xl text-success-foreground" aria-hidden>
        ✓
      </div>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">{t("sentTitle")}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{t("sentLead")}</p>
      </div>
      {isError && <ErrorMessage>{t("errApi")}</ErrorMessage>}
      {tr && (
        <Card className="space-y-4 text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("amountSent")}</span>
            <span className="tabular text-lg font-bold">R {fmt(tr.quote.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("recipientReceives")}</span>
            <span className="tabular text-lg font-bold text-success">
              {fmt(tr.quote.receiveAmount)} {tr.quote.receiveCurrency}
            </span>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-input p-4 text-center">
            <p className="text-sm font-semibold text-muted-foreground">{t("transferId")}</p>
            <p className="font-mono text-3xl font-extrabold tracking-wider">{tr.id}</p>
          </div>
        </Card>
      )}
      <div className="space-y-3">
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
