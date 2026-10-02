import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";

type BtnVariant = "primary" | "secondary" | "accent" | "ghost";
const btnBase =
  "inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full px-6 text-lg font-semibold transition-all duration-200 shadow-md hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none disabled:hover:translate-y-0";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  accent: "bg-accent text-accent-foreground hover:bg-accent/90",
  secondary: "border-2 border-primary bg-card text-primary hover:bg-secondary",
  ghost: "text-primary underline-offset-4 hover:underline min-h-12",
};
export const buttonClass = (v: BtnVariant = "primary", extra?: string) => cn(btnBase, btnVariants[v], extra);

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }>(
  ({ variant = "primary", className, ...p }, ref) => <button ref={ref} className={buttonClass(variant, className)} {...p} />,
);
Button.displayName = "Button";

export function Field({
  label,
  id,
  error,
  ...p
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; error?: string | undefined }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-base font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className="h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-lg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 aria-invalid:border-destructive"
        {...p}
      />
      {error && (
        <p id={`${id}-err`} className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl border-2 border-destructive/30 bg-accent-soft px-4 py-3 font-medium text-destructive">
      ⚠ {children}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8", className)}>{children}</div>;
}

export function LanguageSelector() {
  const { lang, setLang } = useI18n();
  return (
    <label className="relative shrink-0">
      <span className="sr-only">Language</span>
      <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
        🌐
      </span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="min-h-11 appearance-none rounded-full border-2 border-border bg-card py-1 pl-9 pr-8 text-sm font-semibold outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
      >
        {(Object.keys(LANGUAGES) as Lang[]).map((l) => (
          <option key={l} value={l}>
            {LANGUAGES[l].label}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        ▾
      </span>
    </label>
  );
}

export function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-3 text-sm font-semibold transition-all duration-200 active:scale-95",
        on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-input",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          on ? "bg-accent" : "bg-input",
        )}
      >
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-card transition-all", on ? "left-4.5" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight" aria-label="Senda home">
      <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
        ➜
      </span>
      Senda
    </Link>
  );
}

export function Screen({
  title,
  step,
  back,
  children,
}: {
  title: string;
  step?: number;
  back?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500 ease-out">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {back ? (
            <Link to={back} className="-ml-2 inline-flex min-h-11 items-center px-2 font-semibold text-muted-foreground hover:text-foreground">
              ← {t("back")}
            </Link>
          ) : (
            <span />
          )}
          {step && <span className="text-sm font-semibold text-muted-foreground">{t("step", { n: step })}</span>}
        </div>
        {step && (
          <div className="flex gap-1.5" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-accent" : "bg-border")} />
            ))}
          </div>
        )}
        <h1 className="pt-2 text-3xl font-extrabold leading-tight tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}
