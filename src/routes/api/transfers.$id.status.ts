import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { STATUS_FLOW, updateStatus } from "@/lib/senda.server";

const schema = z.object({ status: z.enum(STATUS_FLOW as [string, ...string[]]) });

export const Route = createFileRoute("/api/transfers/$id/status")({
  server: {
    handlers: {
      PUT: async ({ params, request }) => {
        const parsed = schema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "invalid_input" }, { status: 400 });
        const result = updateStatus(params.id, parsed.data.status as (typeof STATUS_FLOW)[number]);
        if ("error" in result)
          return Response.json(result, { status: result.error === "not_found" ? 404 : 409 });
        return Response.json({ transfer: result });
      },
    },
  },
});
