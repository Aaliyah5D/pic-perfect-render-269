import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, countriesQuery } from "./api";
import { useFlow } from "./flow";

/** Live quote for the current draft, computed by the backend. */
export function useQuote() {
  const { draft } = useFlow();
  const countries = useQuery(countriesQuery);
  const dest = countries.data?.find((c) => c.code === draft.toCode);
  const [debounced, setDebounced] = useState(draft.amount);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(draft.amount), 250);
    return () => clearTimeout(id);
  }, [draft.amount]);
  const amount = Number(debounced);
  const q = useQuery({
    queryKey: ["rate", dest?.currencyCode, amount],
    queryFn: () => api.rate(dest!.currencyCode, amount || undefined),
    enabled: !!dest,
    placeholderData: keepPreviousData,
  });
  return { dest, countries: countries.data, ...q, amount };
}
