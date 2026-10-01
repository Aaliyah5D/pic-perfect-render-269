import { cn } from "@/lib/utils";
import { useState } from "react";
import { fmt, type Country, type FeeConfig, type Quote, type Transfer, STATUS_FLOW } from "@/lib/api";
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

export function FeeBreakdown({ quote, country, feeConfig }: { quote: Quote; country: Country; feeConfig?: FeeConfig | undefined }) {
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
      {feeConfig && <FeeWhy quote={quote} cfg={feeConfig} />}
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

export function StatusTracker({ status, name, country }: { status: Transfer["status"]; name?: string | undefined; country?: string | undefined }) {
  const { t } = useI18n();
  const idx = STATUS_FLOW.indexOf(status);
  const finished = status === "COLLECTED";
  return (
    <div>
      <p role="status" aria-live="polite" className="mb-5 rounded-2xl bg-success-soft p-4 text-lg font-semibold">
        {t(MSG_KEY[status])}
        {name && (
          <span className="mt-1 block text-base font-normal text-muted-foreground">
            {t(EXPL_KEY[status], { name, country: country ?? "" })}
          </span>
        )}
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
                  <span className={cn("my-1 flex min-h-8 w-0.5 flex-1 justify-center", i < idx ? "bg-success" : "bg-border")} aria-hidden />
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

const EXPL_KEY = {
  SENT: "expl_SENT",
  IN_TRANSIT: "expl_IN_TRANSIT",
  READY_TO_COLLECT: "expl_READY_TO_COLLECT",
  COLLECTED: "expl_COLLECTED",
} as const;
const RV_KEY = {
  SENT: "rv_SENT",
  IN_TRANSIT: "rv_IN_TRANSIT",
  READY_TO_COLLECT: "rv_READY_TO_COLLECT",
  COLLECTED: "rv_COLLECTED",
} as const;

/** Explains the backend fee config. The fee total always comes from the backend quote. */
export function FeeWhy({ quote, cfg }: { quote: Quote; cfg: FeeConfig }) {
  const { t } = useI18n();
  return (
    <details className="group mt-3 rounded-2xl border-2 border-border p-1">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-3 font-semibold">
        <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-sm">ⓘ</span>
        {t("whyFee")}
        <span aria-hidden className="ml-auto transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="space-y-1 px-3 pb-3 pt-1 text-base">
        <p className="tabular">R {fmt(cfg.flat, 0)} {t("feeFixed")}</p>
        <p className="tabular">+ {cfg.percent * 100}% {t("feeOfAmount")} (R {fmt(quote.amount)})</p>
        <p className="tabular border-t border-border pt-1 font-bold">= R {fmt(quote.fee)} {t("fee").toLowerCase()}</p>
        <p className="text-sm text-muted-foreground">{t("feeMinNote", { min: cfg.min })}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/70">{t("demoPricing")}</p>
      </div>
    </details>
  );
}

/** Phone-style preview of what the recipient sees, driven by real transfer status. */
export function RecipientPhone({ transfer }: { transfer: Transfer }) {
  const { t } = useI18n();
  const ready = transfer.status === "READY_TO_COLLECT";
  return (
    <figure className="space-y-3">
      <div className="mx-auto w-full max-w-[18rem] rounded-[2.5rem] bg-primary p-3 shadow-[0_24px_48px_-20px_oklch(0.245_0.058_265/0.5)]">
        <div className="overflow-hidden rounded-[2rem] bg-background">
          <div className="flex items-center justify-between px-5 pt-3 text-xs font-semibold text-muted-foreground">
            <span>9:41</span>
            <span aria-hidden className="h-5 w-20 rounded-full bg-primary" />
            <span aria-hidden>▮▮▮</span>
          </div>
          <div className="space-y-4 px-4 pb-6 pt-5">
            <div className="flex items-center gap-2">
              <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">➜</span>
              <span className="text-sm font-extrabold tracking-[0.2em]">SENDA</span>
              <span className="ml-auto text-xs text-muted-foreground">{t("rv_now")}</span>
            </div>
            <div key={transfer.status} className="animate-rise space-y-3 rounded-2xl bg-card p-4 shadow-sm">
              <p className="text-lg font-bold leading-snug">
                {t("rv_sent", { name: transfer.sender.name, amount: `${fmt(transfer.quote.receiveAmount)} ${transfer.quote.receiveCurrency}` })}
              </p>
              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "rounded-xl px-3 py-2 text-base font-semibold",
                  ready || transfer.status === "COLLECTED" ? "bg-success-soft text-success" : "bg-accent-soft",
                )}
              >
                {t(RV_KEY[transfer.status])}
              </p>
              <div className="border-t border-border pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("reference")}</p>
                <p className="font-mono text-lg font-bold">{transfer.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="text-center text-sm text-muted-foreground">{t("rv_caption", { name: transfer.recipient.name })}</figcaption>
    </figure>
  );
}

/** USSD presentation of a real transfer (simulation only). */
export function UssdDemo({ transfer }: { transfer: Transfer }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3 rounded-3xl border-2 border-dashed border-input p-4">
      <div>
        <p className="text-lg font-bold">📟 {t("ussdTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("ussdNote")}</p>
      </div>
      <div className="rounded-2xl bg-primary p-4 font-mono text-sm text-primary-foreground">
        {!open ? (
          <div className="space-y-1">
            <p>SENDA (DEMO)</p>
            <p>{t("ussdCheck")}</p>
            <p>{t("ussdExit")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p>{transfer.id}</p>
            <p>{fmt(transfer.quote.receiveAmount)} {transfer.quote.receiveCurrency}</p>
            <p>{t(RV_KEY[transfer.status])}</p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="min-h-11 w-full rounded-xl border-2 border-border bg-card font-mono font-semibold"
      >
        {open ? "0" : "1"} ↵
      </button>
    </div>
  );
}
