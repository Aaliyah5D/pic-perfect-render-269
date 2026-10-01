import { createFileRoute } from "@tanstack/react-router";
import { buildQuote, calculateFee, getRate, MAX_AMOUNT, MIN_AMOUNT } from "@/lib/senda.server";

// GET /api/exchange-rates/ZWG?amount=1000 → rate (+ full quote when amount given)
export const Route = createFileRoute("/api/exchange-rates/$currency")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const rate = getRate(params.currency);
        if (!rate) return Response.json({ error: "unsupported_currency" }, { status: 404 });
        const amountParam = new URL(request.url).searchParams.get("amount");
        const amount = amountParam ? Number(amountParam) : NaN;
        const quote = Number.isFinite(amount) ? buildQuote(amount, params.currency) : null;
        return Response.json({
          base: "ZAR",
          currency: params.currency.toUpperCase(),
          rate,
          limits: { min: MIN_AMOUNT, max: MAX_AMOUNT },
          quote,
          feeFor: Number.isFinite(amount) ? calculateFee(amount) : null,
        });
      },
    },
  },
});
