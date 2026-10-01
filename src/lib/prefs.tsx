import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// UI preferences: Simple Mode (conversational copy) and Senda Lite (low-data, larger UI).
type Prefs = { simple: boolean; lite: boolean };
const Ctx = createContext<Prefs & { toggle: (k: keyof Prefs) => void }>({ simple: false, lite: false, toggle: () => {} });

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Prefs>({ simple: false, lite: false });
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("senda-prefs") ?? "{}");
      setP({ simple: !!saved.simple, lite: !!saved.lite });
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("lite", p.lite);
  }, [p.lite]);
  const toggle = (k: keyof Prefs) =>
    setP((cur) => {
      const next = { ...cur, [k]: !cur[k] };
      localStorage.setItem("senda-prefs", JSON.stringify(next));
      return next;
    });
  return <Ctx.Provider value={{ ...p, toggle }}>{children}</Ctx.Provider>;
}
export const usePrefs = () => useContext(Ctx);
