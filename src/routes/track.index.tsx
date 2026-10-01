import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Button, Field, Screen } from "@/components/senda/ui";

export const Route = createFileRoute("/track/")({
  head: () => ({
    meta: [
      { title: "Track a transfer — Senda" },
      { name: "description", content: "Follow your money from sent to collected." },
      { property: "og:title", content: "Track a transfer — Senda" },
      { property: "og:description", content: "Enter your SND transfer ID to see its status." },
    ],
  }),
  component: TrackSearch,
});

function TrackSearch() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [id, setId] = useState("");
  return (
    <Screen title={t("trackTitle")} back="/">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (id.trim()) nav({ to: "/track/$id", params: { id: id.trim().toUpperCase() } });
        }}
      >
        <Field id="tid" label={t("enterId")} placeholder="SND-XXXXXX" value={id} onChange={(e) => setId(e.target.value)} className="h-14 w-full rounded-xl border-2 border-input bg-card px-4 font-mono text-xl uppercase outline-none focus:border-primary" />
        <Button type="submit" disabled={!id.trim()}>
          {t("find")}
        </Button>
      </form>
    </Screen>
  );
}
