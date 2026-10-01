import { createContext, useContext, useState, type ReactNode } from "react";

// In-progress transfer draft shared across the send-flow screens.
export type Draft = {
  fromCode: string;
  toCode: string;
  amount: string;
  sender: { name: string; city: string };
  recipient: { name: string; phone: string; city: string };
};

// Demo persona pre-fill (editable, not core logic).
const initial: Draft = {
  fromCode: "ZA",
  toCode: "ZW",
  amount: "1000",
  sender: { name: "Thandi", city: "Johannesburg" },
  recipient: { name: "Mai Chipo", phone: "+263 77 123 4567", city: "Harare" },
};

const Ctx = createContext<{ draft: Draft; update: (p: Partial<Draft>) => void; reset: () => void }>(null as never);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(initial);
  return (
    <Ctx.Provider
      value={{ draft, update: (p) => setDraft((d) => ({ ...d, ...p })), reset: () => setDraft(initial) }}
    >
      {children}
    </Ctx.Provider>
  );
}
export const useFlow = () => useContext(Ctx);
