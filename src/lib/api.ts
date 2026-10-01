// Client-side REST wrappers. Types mirror the backend.
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
export const STATUS_FLOW: TransferStatus[] = ["SENT", "IN_TRANSIT", "READY_TO_COLLECT", "COLLECTED"];
export type Quote = {
  sendCurrency: string;
  receiveCurrency: string;
  amount: number;
  fee: number;
  total: number;
  rate: number;
  receiveAmount: number;
};
export type Transfer = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: TransferStatus;
  sender: { name: string; city: string; countryCode: string };
  recipient: { name: string; phone: string; city: string; countryCode: string };
  quote: Quote;
};

export class ApiError extends Error {
  constructor(public code: string, public status: number) {
    super(code);
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? "unknown", res.status);
  return body as T;
}

export const api = {
  countries: () => req<{ countries: Country[] }>("/api/countries").then((r) => r.countries),
  rate: (currency: string, amount?: number) =>
    req<{ rate: number; quote: Quote | null; limits: { min: number; max: number } }>(
      `/api/exchange-rates/${currency}${amount ? `?amount=${amount}` : ""}`,
    ),
  createTransfer: (data: {
    amount: number;
    sender: Transfer["sender"];
    recipient: Transfer["recipient"];
  }) =>
    req<{ transfer: Transfer }>("/api/transfers", { method: "POST", body: JSON.stringify(data) }).then(
      (r) => r.transfer,
    ),
  getTransfer: (id: string) =>
    req<{ transfer: Transfer }>(`/api/transfers/${encodeURIComponent(id)}`).then((r) => r.transfer),
  setStatus: (id: string, status: TransferStatus) =>
    req<{ transfer: Transfer }>(`/api/transfers/${encodeURIComponent(id)}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }).then((r) => r.transfer),
};

export const countriesQuery = { queryKey: ["countries"], queryFn: api.countries, staleTime: Infinity };

export const fmt = (n: number, digits = 2) =>
  new Intl.NumberFormat("en-ZA", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
