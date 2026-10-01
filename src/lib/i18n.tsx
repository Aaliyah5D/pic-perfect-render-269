import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import en from "@/locales/en";
import sn from "@/locales/sn";
import zu from "@/locales/zu";

export const LANGUAGES = {
  en: { label: "English", dict: en },
  zu: { label: "isiZulu", dict: zu },
  sn: { label: "Shona", dict: sn },
} as const;
export type Lang = keyof typeof LANGUAGES;
export type TKey = keyof typeof en;

type I18n = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey, vars?: Record<string, string | number>) => string };
// Safe English fallback so components never crash if rendered outside the provider (e.g. during hot reload).
const fallback: I18n = {
  lang: "en",
  setLang: () => {},
  t: (k, vars) => {
    let s: string = en[k];
    if (vars) for (const [key, v] of Object.entries(vars)) s = s.replaceAll(`{${key}}`, String(v));
    return s;
  },
};
const Ctx = createContext<I18n>(fallback);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem("senda-lang") as Lang | null;
    if (saved && saved in LANGUAGES) setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("senda-lang", l);
  };
  const t = (k: TKey, vars?: Record<string, string | number>) => {
    let s: string = (LANGUAGES[lang].dict as Record<string, string>)[k] ?? en[k];
    if (vars) for (const [key, v] of Object.entries(vars)) s = s.replaceAll(`{${key}}`, String(v));
    return s;
  };
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
