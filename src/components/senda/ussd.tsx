import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, countriesQuery, fmt, type Quote, type Transfer } from "@/lib/api";
import { useFlow } from "@/lib/flow";
import { cn } from "@/lib/utils";

// USSD simulator: a thin UI over the existing countries, quote, transfer and status APIs.
type Screen =
  | { s: "menu" }
  | { s: "country" }
  | { s: "other" }
  | { s: "amount"; code: string }
  | { s: "confirm"; code: string; quote: Quote }
  | { s: "done"; transfer: Transfer }
  | { s: "trackInput" }
  | { s: "status"; transfer: Transfer }
  | { s: "bye" }
  | { s: "error"; msg: string };

const MENU_COUNTRIES = ["ZW", "MZ", "ZM", "LS"];
const STATUS_LABEL: Record<Transfer["status"], string> = {
  SENT: "Sent",
  IN_TRANSIT: "In Transit",
  READY_TO_COLLECT: "Ready to Collect",
  COLLECTED: "Collected",
};

export function UssdSimulator({ onClose }: { onClose: () => void }) {
  const { draft } = useFlow();
  const qc = useQueryClient();
  const { data: countries } = useQuery(countriesQuery);
  const [screen, setScreen] = useState<Screen>({ s: "menu" });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState<string>("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = (sc: Screen, preset = "") => {
    setScreen(sc);
    setInput(preset);
  };
  const country = (code: string) => countries?.find((c) => c.code === code);

  const lookup = async (id: string) => {
    setBusy(true);
    try {
      const t = await api.getTransfer(id.trim().toUpperCase());
      qc.setQueryData(["transfer", t.id], t);
      go({ s: "status", transfer: t });
    } catch (e) {
      go({ s: "error", msg: e instanceof ApiError && e.status === 404 ? "Transfer not found." : "Network error. Try again." });
    } finally {
      setBusy(false);
    }
  };

  const submit = async (raw: string) => {
    const v = raw.trim();
    if (busy) return;
    switch (screen.s) {
      case "menu":
        if (v === "1") go({ s: "country" });
        else if (v === "2") go({ s: "trackInput" }, lastId);
        else if (v === "3") lastId ? lookup(lastId) : go({ s: "trackInput" });
        else if (v === "4") go({ s: "bye" });
        else setInput("");
        return;
      case "country": {
        const code = MENU_COUNTRIES[Number(v) - 1];
        if (code) go({ s: "amount", code });
        else if (v === "5") go({ s: "other" });
        else setInput("");
        return;
      }
      case "other":
      case "error":
      case "bye":
        go({ s: "menu" });
        return;
      case "amount": {
        const c = country(screen.code);
        if (!c) return;
        setBusy(true);
        try {
          const r = await api.rate(c.currencyCode, Number(v) || undefined);
          if (!r.quote) go({ s: "error", msg: `Enter between R${r.limits.min} and R${r.limits.max}.` });
          else go({ s: "confirm", code: screen.code, quote: r.quote });
        } catch {
          go({ s: "error", msg: "Network error. Try again." });
        } finally {
          setBusy(false);
        }
        return;
      }
      case "confirm":
        if (v === "2") return go({ s: "menu" });
        if (v !== "1") return setInput("");
        setBusy(true);
        try {
          const t = await api.createTransfer({
            amount: screen.quote.amount,
            sender: { ...draft.sender, countryCode: draft.fromCode },
            recipient: { ...draft.recipient, countryCode: screen.code },
          });
          qc.setQueryData(["transfer", t.id], t);
          setLastId(t.id);
          go({ s: "done", transfer: t });
        } catch {
          go({ s: "error", msg: "Transfer failed. Try again." });
        } finally {
          setBusy(false);
        }
        return;
      case "done":
        if (v === "1") lookup(screen.transfer.id);
        else if (v === "2") go({ s: "menu" });
        else setInput("");
        return;
      case "trackInput":
        if (v) lookup(v);
        return;
      case "status":
        if (v === "1") lookup(screen.transfer.id);
        else go({ s: "menu" });
        return;
    }
  };

  // Screen content: lines + selectable options.
  let title = "";
  let lines: string[] = [];
  let options: [string, string][] = [];
  let prompt: string | null = null;
  switch (screen.s) {
    case "menu":
      title = "Welcome to Senda";
      options = [["1", "Send Money"], ["2", "Track Transfer"], ["3", "Check Status"], ["4", "Exit"]];
      break;
    case "country":
      title = "Send money to:";
      options = [...MENU_COUNTRIES.map((c, i) => [String(i + 1), country(c)?.name ?? c] as [string, string]), ["5", "Other"]];
      break;
    case "other":
      title = "More countries";
      lines = ["Use the Senda app for other destinations."];
      options = [["0", "Main Menu"]];
      break;
    case "amount":
      title = `To ${country(screen.code)?.name}`;
      prompt = "Enter amount in ZAR:";
      break;
    case "confirm": {
      const q = screen.quote;
      title = "Confirm transfer";
      lines = [
        `You send: R${fmt(q.amount, 0)}`,
        `Fee: R${fmt(q.fee, 0)}`,
        `Recipient receives: ${fmt(q.receiveAmount)} ${q.receiveCurrency}`,
        `Destination: ${country(screen.code)?.name}`,
      ];
      options = [["1", "Confirm"], ["2", "Cancel"]];
      break;
    }
    case "done":
      title = "Transfer successful!";
      lines = ["Reference:", screen.transfer.id, "Your money is on its way."];
      options = [["1", "Track Transfer"], ["2", "Main Menu"]];
      break;
    case "trackInput":
      title = "Track Transfer";
      prompt = "Enter reference (SND-XXXXXX):";
      break;
    case "status":
      title = screen.transfer.id;
      lines = [
        `Status: ${STATUS_LABEL[screen.transfer.status]}`,
        `${fmt(screen.transfer.quote.receiveAmount)} ${screen.transfer.quote.receiveCurrency}`,
        `To: ${screen.transfer.recipient.name}`,
      ];
      options = [["1", "Refresh"], ["0", "Main Menu"]];
      break;
    case "bye":
      title = "Thank you for using Senda.";
      options = [["0", "Start again"]];
      break;
    case "error":
      title = "Error";
      lines = [screen.msg];
      options = [["0", "Main Menu"]];
      break;
  }

  const press = (k: string) => {
    if (prompt) setInput((i) => (i + k).slice(0, 12));
    else submit(k);
  };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ussd-title"
      className="animate-in fade-in fixed inset-0 z-50 overflow-y-auto bg-primary/70 p-4 duration-500 ease-out backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center justify-center gap-4 py-4">
        <div className="text-center text-primary-foreground">
          <h2 id="ussd-title" className="text-xl font-extrabold">Senda USSD Demo</h2>
          <p className="text-sm opacity-90">Designed for customers without smartphones or reliable mobile data.</p>
        </div>

        {/* Feature-phone body */}
        <div className="w-full max-w-[17rem] rounded-[2.25rem] bg-foreground p-4 pb-5 shadow-[0_30px_60px_-20px_oklch(0_0_0/0.6)]">
          <div className="mb-3 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-background/70">
            <span>Senda</span>
            <span className="rounded bg-accent px-1.5 py-0.5 text-accent-foreground">Demo</span>
          </div>
          <div className="rounded-xl border-4 border-foreground bg-[oklch(0.9_0.05_130)] p-3 font-mono text-[13px] leading-snug text-foreground shadow-inner">
            <div className="mb-1 flex justify-between border-b border-foreground/30 pb-1 text-[11px] font-bold">
              <span>SENDA USSD</span>
              <span aria-hidden>▂▄▆</span>
            </div>
            <div className="min-h-44" aria-live="polite">
              <p className="font-bold">{busy ? "Please wait…" : title}</p>
              {!busy && lines.map((l, i) => <p key={i} className="break-words">{l}</p>)}
              {!busy && options.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {options.map(([k, label]) => (
                    <li key={k}>
                      <button type="button" onClick={() => submit(k)} className="w-full cursor-pointer rounded-xl px-1 text-left transition-colors hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background">
                        {k}. {label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!busy && prompt && (
                <form
                  className="mt-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit(input);
                  }}
                >
                  <label htmlFor="ussd-in" className="block">{prompt}</label>
                  <input
                    id="ussd-in"
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value.slice(0, 12))}
                    inputMode={screen.s === "amount" ? "numeric" : "text"}
                     className="mt-1 w-full border-b-2 border-foreground bg-transparent px-1 uppercase outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                </form>
              )}
            </div>
          </div>

          {/* Soft keys */}
          <div className="mt-3 grid grid-cols-2 gap-2">
             <button type="button" onClick={() => (prompt ? setInput((i) => i.slice(0, -1)) : go({ s: "menu" }))} className="min-h-10 rounded-full bg-background/15 text-xs font-bold text-background transition-all duration-200 hover:bg-background/20 active:scale-95">
              {prompt ? "⌫ Clear" : "Menu"}
            </button>
             <button type="button" disabled={busy || (!!prompt && !input)} onClick={() => submit(input)} className="min-h-10 rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:opacity-50">
              Send
            </button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {keys.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => press(k)}
                disabled={busy}
                 className={cn("min-h-10 rounded-xl bg-background/10 font-mono text-lg font-bold text-background transition-all duration-200 hover:bg-background/20 active:scale-95")}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-primary-foreground">
          <p className="font-mono font-bold">*120*SENDA#</p>
          <p className="opacity-90">Senda prototype USSD · DEMO — No real transaction</p>
        </div>
         <button type="button" onClick={onClose} className="min-h-12 rounded-full bg-card px-6 font-semibold text-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95">
          Close USSD
        </button>
      </div>
    </div>
  );
}
