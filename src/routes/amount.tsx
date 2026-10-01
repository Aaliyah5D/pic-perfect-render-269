import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useFlow } from "@/lib/flow";
import { useI18n } from "@/lib/i18n";
import { useQuote } from "@/lib/use-quote";
import { Button, ErrorMessage, Screen } from "@/components/senda/ui";
import { AmountInput, FeeBreakdown } from "@/components/senda/money";

export const Route = createFileRoute("/amount")({
  head: () => ({
    meta: [
      { title: "Enter amount — Senda" },
      { name: "description", content: "See the fee, rate and exactly what your recipient gets." },
      { property: "og:title", content: "Enter amount — Senda" },
      { property: "og:description", content: "Transparent fees before you send." },
    ],
  }),
  component: AmountPage,
});

function AmountPage() {
  const { t } = useI18n();
  const { draft, update } = useFlow();
  const nav = useNavigate();
  const { dest, data, isError } = useQuote();
  const limits = data?.limits ?? { min: 50, max: 5000 };
  const n = Number(draft.amount);
  const invalid = draft.amount !== "" && (!Number.isFinite(n) || n < limits.min || n > limits.max);
  const quote = !invalid && data?.quote && data.quote.amount === n ? data.quote : data?.quote && !invalid ? data.quote : null;

  return (
    <Screen title={t("howMuch")} step={2} back="/send">
      <div className="space-y-2">
        <AmountInput label={t("youSend")} value={draft.amount} onChange={(v) => update({ amount: v })} error={invalid ? t("errAmount") : undefined} />
        <p className={invalid ? "text-sm font-medium text-destructive" : "text-sm text-muted-foreground"}>
          {invalid ? `${t("errAmount")} ` : ""}
          {t("limits", { min: limits.min, max: limits.max.toLocaleString("en-ZA") })}
        </p>
      </div>
      {isError && <ErrorMessage>{t("errApi")}</ErrorMessage>}
      {dest && quote && <FeeBreakdown quote={quote} country={dest} />}
      <p className="text-center text-xs text-muted-foreground">{t("mockRate")}</p>
      <Button disabled={!quote || invalid || !draft.amount} onClick={() => nav({ to: "/recipient" })}>
        {t("continue")} →
      </Button>
    </Screen>
  );
}
