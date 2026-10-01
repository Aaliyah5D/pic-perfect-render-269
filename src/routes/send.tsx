import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { countriesQuery } from "@/lib/api";
import { useFlow } from "@/lib/flow";
import { useI18n } from "@/lib/i18n";
import { Button, ErrorMessage, Screen } from "@/components/senda/ui";
import { CountrySelector } from "@/components/senda/money";

export const Route = createFileRoute("/send")({
  head: () => ({
    meta: [
      { title: "Choose destination — Senda" },
      { name: "description", content: "Pick where you're sending money from and to." },
      { property: "og:title", content: "Choose destination — Senda" },
      { property: "og:description", content: "Send from South Africa to 9 African countries." },
    ],
  }),
  component: SendPage,
});

function SendPage() {
  const { t } = useI18n();
  const { draft, update } = useFlow();
  const nav = useNavigate();
  const { data, isError, isLoading, refetch } = useQuery(countriesQuery);
  const origins = data?.filter((c) => c.role === "origin") ?? [];
  const dests = data?.filter((c) => c.role === "destination") ?? [];

  return (
    <Screen title={t("whereTitle")} step={1} back="/">
      {isLoading && <p>{t("loading")}</p>}
      {isError && (
        <div className="space-y-3">
          <ErrorMessage>{t("errApi")}</ErrorMessage>
          <Button variant="secondary" onClick={() => refetch()}>↻</Button>
        </div>
      )}
      {data && (
        <>
          <CountrySelector label={t("sendingFrom")} countries={origins} value={draft.fromCode} onChange={(c) => update({ fromCode: c })} />
          <CountrySelector label={t("sendingTo")} countries={dests} value={draft.toCode} onChange={(c) => update({ toCode: c })} />
          <div className="sticky bottom-4">
            <Button onClick={() => nav({ to: "/amount" })} disabled={!draft.toCode}>
              {t("continue")} →
            </Button>
          </div>
        </>
      )}
    </Screen>
  );
}
