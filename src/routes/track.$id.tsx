import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, countriesQuery, fmt, STATUS_FLOW } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Button, Card, ErrorMessage, Screen } from "@/components/senda/ui";
import { StatusTracker } from "@/components/senda/money";

export const Route = createFileRoute("/track/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Transfer ${params.id} — Senda` },
      { name: "description", content: "Live status of your Senda transfer." },
      { property: "og:title", content: `Transfer ${params.id} — Senda` },
      { property: "og:description", content: "Sent → In Transit → Ready to Collect → Collected." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { id } = Route.useParams();
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data: countries } = useQuery(countriesQuery);
  const { data: tr, error, isLoading } = useQuery({
    queryKey: ["transfer", id],
    queryFn: () => api.getTransfer(id),
    retry: false,
  });
  const next = tr ? STATUS_FLOW[STATUS_FLOW.indexOf(tr.status) + 1] : undefined;
  const advance = useMutation({
    mutationFn: () => api.setStatus(id, next!),
    onSuccess: (updated) => qc.setQueryData(["transfer", id], updated),
  });
  const dest = countries?.find((c) => c.code === tr?.recipient.countryCode);

  return (
    <Screen title={t("trackTitle")} back="/track">
      {isLoading && <p>{t("loading")}</p>}
      {error && <ErrorMessage>{error instanceof ApiError && error.status === 404 ? t("errNotFound") : t("errApi")}</ErrorMessage>}
      {tr && (
        <>
          <Card className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden>
                {dest?.flag}
              </span>
              <div className="flex-1">
                <p className="text-lg font-bold">{tr.recipient.name}</p>
                <p className="text-muted-foreground">
                  {tr.recipient.city}, {dest?.name}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3">
              <div>
                <dt className="text-sm text-muted-foreground">{t("amount")}</dt>
                <dd className="tabular font-bold">
                  {fmt(tr.quote.receiveAmount)} {tr.quote.receiveCurrency}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">{t("transferId")}</dt>
                <dd className="font-mono font-bold">{tr.id}</dd>
              </div>
            </dl>
          </Card>
          <Card>
            <StatusTracker status={tr.status} />
          </Card>
          {next && (
            <div className="space-y-2 rounded-2xl border-2 border-dashed border-input p-4">
              <p className="text-sm text-muted-foreground">{t("demoOnly")}</p>
              {advance.isError && <ErrorMessage>{t("errApi")}</ErrorMessage>}
              <Button variant="secondary" disabled={advance.isPending} onClick={() => advance.mutate()}>
                {t("advance")} →
              </Button>
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
