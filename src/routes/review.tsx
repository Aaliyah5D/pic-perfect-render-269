import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useFlow } from "@/lib/flow";
import { useI18n } from "@/lib/i18n";
import { useQuote } from "@/lib/use-quote";
import { Button, buttonClass, Card, ErrorMessage, Screen } from "@/components/senda/ui";
import { FeeBreakdown } from "@/components/senda/money";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review transfer — Senda" },
      { name: "description", content: "Check every cost before you send." },
      { property: "og:title", content: "Review transfer — Senda" },
      { property: "og:description", content: "No hidden fees. Ever." },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { t } = useI18n();
  const { draft } = useFlow();
  const nav = useNavigate();
  const { dest, countries, data } = useQuote();
  const origin = countries?.find((c) => c.code === draft.fromCode);
  const m = useMutation({
    mutationFn: () =>
      api.createTransfer({
        amount: Number(draft.amount),
        sender: { ...draft.sender, countryCode: draft.fromCode },
        recipient: { ...draft.recipient, countryCode: draft.toCode },
      }),
    onSuccess: (tr) => nav({ to: "/success/$id", params: { id: tr.id } }),
  });

  return (
    <Screen title={t("reviewTitle")} step={4} back="/recipient">
      {dest && data?.quote && <FeeBreakdown quote={data.quote} country={dest} />}
      <Card className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{t("from")}</p>
          <p className="text-lg font-bold">{draft.sender.name}</p>
          <p className="text-muted-foreground">
            {draft.sender.city}, {origin?.name} {origin?.flag}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{t("to")}</p>
          <p className="text-lg font-bold">{draft.recipient.name}</p>
          <p className="text-muted-foreground">
            {draft.recipient.city}, {dest?.name} {dest?.flag}
          </p>
          <p className="text-sm text-muted-foreground">{draft.recipient.phone}</p>
        </div>
      </Card>
      {m.isError && <ErrorMessage>{t("errApi")}</ErrorMessage>}
      <div className="space-y-3">
        <Button variant="accent" disabled={m.isPending || !data?.quote} onClick={() => m.mutate()}>
          {m.isPending ? t("sending") : `${t("confirmSend")} ✓`}
        </Button>
        <Link to="/amount" className={buttonClass("secondary")}>
          {t("editTransfer")}
        </Link>
      </div>
    </Screen>
  );
}
