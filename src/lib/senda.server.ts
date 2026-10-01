// Senda business logic (mock database + services). Server-only.
export type Country = {
  id: string;
  name: string;
  code: string;
  flag: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  supported: boolean;
  role: "origin" | "destination";
};

export type TransferStatus = "SENT" | "IN_TRANSIT" | "READY_TO_COLLECT" | "COLLECTED";

export type Transfer = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: TransferStatus;
  sender: { name: string; city: string; countryCode: string };
  recipient: { name: string; phone: string; city: string; countryCode: string };
  quote: Quote;
};

export type Quote = {
  sendCurrency: string;
  receiveCurrency: string;
  amount: number;
  fee: number;
  total: number;
  rate: number;
  receiveAmount: number;
};

// ---- Country service (add a country = add a row) ----
const COUNTRIES: Country[] = [
  { id: "za", name: "South Africa", code: "ZA", flag: "🇿🇦", currency: "South African Rand", currencyCode: "ZAR", currencySymbol: "R", supported: true, role: "origin" },
  { id: "zw", name: "Zimbabwe", code: "ZW", flag: "🇿🇼", currency: "Zimbabwe Gold", currencyCode: "ZWG", currencySymbol: "ZiG", supported: true, role: "destination" },
  { id: "mz", name: "Mozambique", code: "MZ", flag: "🇲🇿", currency: "Mozambican Metical", currencyCode: "MZN", currencySymbol: "MT", supported: true, role: "destination" },
  { id: "ls", name: "Lesotho", code: "LS", flag: "🇱🇸", currency: "Lesotho Loti", currencyCode: "LSL", currencySymbol: "L", supported: true, role: "destination" },
  { id: "sz", name: "Eswatini", code: "SZ", flag: "🇸🇿", currency: "Swazi Lilangeni", currencyCode: "SZL", currencySymbol: "E", supported: true, role: "destination" },
  { id: "bw", name: "Botswana", code: "BW", flag: "🇧🇼", currency: "Botswana Pula", currencyCode: "BWP", currencySymbol: "P", supported: true, role: "destination" },
  { id: "zm", name: "Zambia", code: "ZM", flag: "🇿🇲", currency: "Zambian Kwacha", currencyCode: "ZMW", currencySymbol: "K", supported: true, role: "destination" },
  { id: "mw", name: "Malawi", code: "MW", flag: "🇲🇼", currency: "Malawian Kwacha", currencyCode: "MWK", currencySymbol: "MK", supported: true, role: "destination" },
  { id: "gh", name: "Ghana", code: "GH", flag: "🇬🇭", currency: "Ghanaian Cedi", currencyCode: "GHS", currencySymbol: "₵", supported: true, role: "destination" },
  { id: "ng", name: "Nigeria", code: "NG", flag: "🇳🇬", currency: "Nigerian Naira", currencyCode: "NGN", currencySymbol: "₦", supported: true, role: "destination" },
];

export const listCountries = () => COUNTRIES.filter((c) => c.supported);
export const getCountry = (code: string) =>
  COUNTRIES.find((c) => c.code === code.toUpperCase() && c.supported);

// ---- Mock FX service (1 ZAR = X) ----
const MOCK_RATES: Record<string, number> = {
  ZAR: 1,
  ZWG: 1.48,
  MZN: 3.52,
  LSL: 1,
  SZL: 1,
  BWP: 0.74,
  ZMW: 1.46,
  MWK: 95.3,
  GHS: 0.84,
  NGN: 86.7,
};
export const getRate = (currencyCode: string) => MOCK_RATES[currencyCode.toUpperCase()];

// ---- Fee service: flat fee + percentage, configurable ----
const FEE_CONFIG = { flat: 15, percent: 0.02, min: 20 };
export const calculateFee = (amount: number) =>
  round2(Math.max(FEE_CONFIG.min, FEE_CONFIG.flat + amount * FEE_CONFIG.percent));

const round2 = (n: number) => Math.round(n * 100) / 100;

export const MIN_AMOUNT = 50;
export const MAX_AMOUNT = 5000;

export function buildQuote(amount: number, receiveCurrency: string): Quote | null {
  const rate = getRate(receiveCurrency);
  if (!rate || !Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) return null;
  const fee = calculateFee(amount);
  return {
    sendCurrency: "ZAR",
    receiveCurrency: receiveCurrency.toUpperCase(),
    amount: round2(amount),
    fee,
    total: round2(amount + fee),
    rate,
    receiveAmount: round2(amount * rate),
  };
}

// ---- Status state machine ----
export const STATUS_FLOW: TransferStatus[] = ["SENT", "IN_TRANSIT", "READY_TO_COLLECT", "COLLECTED"];
export function canTransition(from: TransferStatus, to: TransferStatus) {
  return STATUS_FLOW.indexOf(to) === STATUS_FLOW.indexOf(from) + 1;
}

// ---- Transfer service (in-memory mock DB) ----
const g = globalThis as unknown as { __sendaTransfers?: Map<string, Transfer> };
const store = (g.__sendaTransfers ??= new Map());

function newId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return `SND-${id}`;
}

export function createTransfer(input: {
  amount: number;
  sender: Transfer["sender"];
  recipient: Transfer["recipient"];
}): Transfer | { error: string } {
  const dest = getCountry(input.recipient.countryCode);
  if (!dest || dest.role !== "destination") return { error: "unsupported_country" };
  const quote = buildQuote(input.amount, dest.currencyCode);
  if (!quote) return { error: "invalid_amount" };
  const now = new Date().toISOString();
  let id = newId();
  while (store.has(id)) id = newId();
  const t: Transfer = { id, createdAt: now, updatedAt: now, status: "SENT", sender: input.sender, recipient: input.recipient, quote };
  store.set(id, t);
  return t;
}

export const getTransfer = (id: string) => store.get(id.toUpperCase().trim());

export function updateStatus(id: string, to: TransferStatus): Transfer | { error: string } {
  const t = getTransfer(id);
  if (!t) return { error: "not_found" };
  if (!canTransition(t.status, to)) return { error: "invalid_transition" };
  t.status = to;
  t.updatedAt = new Date().toISOString();
  return t;
}
