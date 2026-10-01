import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createTransfer } from "@/lib/senda.server";

const schema = z.object({
  amount: z.number().positive(),
  sender: z.object({
    name: z.string().trim().min(1).max(100),
    city: z.string().trim().min(1).max(100),
    countryCode: z.string().length(2),
  }),
  recipient: z.object({
    name: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(6).max(20),
    city: z.string().trim().min(1).max(100),
    countryCode: z.string().length(2),
  }),
});

export const Route = createFileRoute("/api/transfers")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = schema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });
        const result = createTransfer(parsed.data);
        if ("error" in result) return Response.json(result, { status: 400 });
        return Response.json({ transfer: result }, { status: 201 });
      },
    },
  },
});
