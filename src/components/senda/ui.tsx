import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useI18n, LANGUAGES, type Lang } from "@/lib/i18n";

type BtnVariant = "primary" | "secondary" | "accent" | "ghost";
const btnBase =
  "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-6 text-lg font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none";
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
        className="h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-lg outline-none focus:border-primary aria-invalid:border-destructive"
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
  return <div className={cn("rounded-3xl bg-card p-5 shadow-[0_1px_2px_oklch(0.245_0.058_265/0.06),0_8px_24px_-12px_oklch(0.245_0.058_265/0.18)]", className)}>{children}</div>;
}

export function LanguageSelector() {
  const { lang, setLang } = useI18n();
  return (
    <div role="group" aria-label="Language" className="flex rounded-full border-2 border-border bg-card p-0.5 text-sm font-semibold">
      {(Object.keys(LANGUAGES) as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "min-h-9 rounded-full px-3",
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {LANGUAGES[l].label}
        </button>
      ))}
    </div>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight" aria-label="Senda home">
      <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
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
    <div className="space-y-6">
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
