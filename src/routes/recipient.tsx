import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { countriesQuery } from "@/lib/api";
import { useFlow } from "@/lib/flow";
import { useI18n } from "@/lib/i18n";
import { Button, ErrorMessage, Field, Screen } from "@/components/senda/ui";

export const Route = createFileRoute("/recipient")({
  head: () => ({
    meta: [
      { title: "Recipient details — Senda" },
      { name: "description", content: "Tell us who is receiving the money." },
      { property: "og:title", content: "Recipient details — Senda" },
      { property: "og:description", content: "A short, simple recipient form." },
    ],
  }),
  component: RecipientPage,
});

function RecipientPage() {
  const { t } = useI18n();
  const { draft, update } = useFlow();
  const nav = useNavigate();
  const { data } = useQuery(countriesQuery);
  const dest = data?.find((c) => c.code === draft.toCode);
  const [tried, setTried] = useState(false);
  const r = draft.recipient;
  const s = draft.sender;
  const phoneOk = r.phone.replace(/\D/g, "").length >= 7;
  const complete = r.name.trim() && r.city.trim() && phoneOk && s.name.trim() && s.city.trim();
  const err = (v: string) => (tried && !v.trim() ? t("errRecipient") : undefined);

  return (
    <Screen title={t("whoTitle")} step={3} back="/amount">
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setTried(true);
          if (complete) nav({ to: "/review" });
        }}
      >
        {tried && !complete && <ErrorMessage>{t("errRecipient")}</ErrorMessage>}
        <Field id="rname" label={`${t("recipientName")} — ${t("fullName")}`} autoComplete="off" value={r.name} error={err(r.name)} onChange={(e) => update({ recipient: { ...r, name: e.target.value } })} />
        <Field id="rphone" label={t("phone")} type="tel" inputMode="tel" value={r.phone} error={tried && !phoneOk ? t("errPhone") : undefined} onChange={(e) => update({ recipient: { ...r, phone: e.target.value } })} />
        <div className="space-y-1.5">
          <span className="block text-base font-semibold">{t("country")}</span>
          <div className="flex h-14 items-center gap-3 rounded-xl border-2 border-border bg-muted px-4 text-lg">
            <span aria-hidden>{dest?.flag}</span> {dest?.name}
          </div>
        </div>
        <Field id="rcity" label={t("city")} value={r.city} error={err(r.city)} onChange={(e) => update({ recipient: { ...r, city: e.target.value } })} />

        <h2 className="pt-4 text-xl font-bold">{t("yourDetails")}</h2>
        <Field id="sname" label={t("yourName")} autoComplete="name" value={s.name} error={err(s.name)} onChange={(e) => update({ sender: { ...s, name: e.target.value } })} />
        <Field id="scity" label={t("yourCity")} value={s.city} error={err(s.city)} onChange={(e) => update({ sender: { ...s, city: e.target.value } })} />
        <Button type="submit">{t("reviewTransfer")} →</Button>
      </form>
    </Screen>
  );
}
