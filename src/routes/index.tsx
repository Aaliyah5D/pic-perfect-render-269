import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { buttonClass, Card } from "@/components/senda/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Senda — Send money home. Simply." },
      { name: "description", content: "Know exactly what you pay and exactly what your family receives." },
      { property: "og:title", content: "Senda — Send money home. Simply." },
      { property: "og:description", content: "Clear fees. Simple transfers. Peace of mind." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-8 pt-6">
      <section className="space-y-4">
        <p className="inline-block rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold">🇿🇦 → 🇿🇼 🇲🇿 🇱🇸 🇸🇿 🇧🇼 🇿🇲 🇲🇼 🇬🇭 🇳🇬</p>
        <h1 className="text-5xl font-extrabold leading-[1.02] tracking-tight">{t("tagline")}</h1>
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

      <section aria-labelledby="recent">
        <h2 id="recent" className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("recent")}
        </h2>
        <Card className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-2xl" aria-hidden>
            🇿🇼
          </span>
          <div className="flex-1">
            <p className="font-bold">{t("recentName")}</p>
            <p className="text-muted-foreground">{t("recentAmount")}</p>
          </div>
          <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success">
            ✓ {t("status_READY_TO_COLLECT")}
          </span>
        </Card>
      </section>

      <p className="text-center text-sm font-medium text-muted-foreground">{t("support")}</p>
    </div>
  );
}
