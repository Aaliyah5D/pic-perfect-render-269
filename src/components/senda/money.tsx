import { cn } from "@/lib/utils";
import { fmt, type Country, type Quote, type Transfer, STATUS_FLOW } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card } from "./ui";

export function CountrySelector({
  label,
  countries,
  value,
  onChange,
  disabled,
}: {
  label: string;
  countries: Country[];
  value: string;
  onChange?: (code: string) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-base font-semibold">{label}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {countries.map((c) => {
          const selected = c.code === value;
          return (
            <label
              key={c.code}
              className={cn(
                "flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-card px-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring",
                selected ? "border-primary" : "border-border hover:border-input",
                disabled && "cursor-default",
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={label}
                value={c.code}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange?.(c.code)}
              />
              <span className="text-3xl" aria-hidden>
                {c.flag}
              </span>
              <span className="flex-1">
                <span className="block text-lg font-semibold">{c.name}</span>
                <span className="block text-sm text-muted-foreground">{c.currencyCode}</span>
              </span>
              {selected && (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-sm text-primary-foreground" aria-hidden>
                  ✓
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function AmountInput({
  value,
  onChange,
  label,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  error?: string | undefined;
}) {
  return (
    <div>
      <label htmlFor="amount" className="sr-only">
        {label}
      </label>
      <div
        className={cn(
          "flex items-baseline gap-2 rounded-3xl border-2 bg-card px-5 py-4 focus-within:border-primary",
          error ? "border-destructive" : "border-border",
        )}
      >
        <span className="text-4xl font-bold text-muted-foreground">R</span>
        <input
          id="amount"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
          aria-invalid={!!error}
          className="tabular w-full bg-transparent text-5xl font-extrabold tracking-tight outline-none"
        />
        <span className="text-lg font-semibold text-muted-foreground">ZAR</span>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={cn("text-base", strong ? "font-semibold" : "text-muted-foreground")}>{label}</dt>
      <dd className={cn("tabular text-right", strong ? "text-xl font-extrabold" : "text-lg font-semibold")}>{value}</dd>
    </div>
  );
}

export function FeeBreakdown({ quote, country }: { quote: Quote; country: Country }) {
  const { t } = useI18n();
  return (
    <Card>
      <dl className="divide-y divide-border">
        <Row label={t("youSend")} value={`R ${fmt(quote.amount)}`} />
        <Row label={t("fee")} value={`+ R ${fmt(quote.fee)}`} />
        <Row label={t("rate")} value={`1 ZAR = ${fmt(quote.rate, quote.rate < 10 ? 2 : 1)} ${quote.receiveCurrency}`} />
        <Row label={t("totalCost")} value={`R ${fmt(quote.total)}`} strong />
      </dl>
      <div className="mt-3 rounded-2xl bg-success-soft p-4">
        <p className="text-sm font-semibold text-success">{t("recipientGets")}</p>
        <p className="tabular text-3xl font-extrabold tracking-tight">
          {fmt(quote.receiveAmount)} <span className="text-xl">{quote.receiveCurrency}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {country.flag} {country.name}
        </p>
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-success">✓ {t("noHidden")}</p>
    </Card>
  );
}

const STATUS_KEY = {
  SENT: "status_SENT",
  IN_TRANSIT: "status_IN_TRANSIT",
  READY_TO_COLLECT: "status_READY_TO_COLLECT",
  COLLECTED: "status_COLLECTED",
} as const;
const MSG_KEY = {
  SENT: "msg_SENT",
  IN_TRANSIT: "msg_IN_TRANSIT",
  READY_TO_COLLECT: "msg_READY_TO_COLLECT",
  COLLECTED: "msg_COLLECTED",
} as const;

export function StatusTracker({ status }: { status: Transfer["status"] }) {
  const { t } = useI18n();
  const idx = STATUS_FLOW.indexOf(status);
  const finished = status === "COLLECTED";
  return (
    <div>
      <p role="status" aria-live="polite" className="mb-5 rounded-2xl bg-success-soft p-4 text-lg font-semibold">
        {t(MSG_KEY[status])}
      </p>
      <ol className="space-y-0">
        {STATUS_FLOW.map((s, i) => {
          const done = i < idx || (finished && i === idx);
          const current = i === idx && !finished;
          return (
            <li key={s} className="flex gap-4" aria-current={current ? "step" : undefined}>
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 text-lg font-bold",
                    done && "border-success bg-success text-success-foreground",
                    current && "border-accent bg-accent text-accent-foreground ring-4 ring-accent-soft",
                    !done && !current && "border-input bg-card text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {done ? "✓" : current ? "●" : "○"}
                </span>
                {i < STATUS_FLOW.length - 1 && (
                  <span className={cn("my-1 w-0.5 flex-1 min-h-6", i < idx ? "bg-success" : "bg-border")} aria-hidden />
                )}
              </div>
              <div className="pb-6 pt-1.5">
                <p className={cn("text-lg font-bold", !done && !current && "text-muted-foreground")}>
                  {i + 1}. {t(STATUS_KEY[s])}
                </p>
                <p className="text-sm text-muted-foreground">
                  {done ? t("done") : current ? t("current") : t("waiting")}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function statusLabelKey(s: Transfer["status"]) {
  return STATUS_KEY[s];
}
