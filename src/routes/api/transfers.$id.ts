import { createFileRoute } from "@tanstack/react-router";
import { getTransfer } from "@/lib/senda.server";

export const Route = createFileRoute("/api/transfers/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const t = getTransfer(params.id);
        if (!t) return Response.json({ error: "not_found" }, { status: 404 });
        return Response.json({ transfer: t });
      },
    },
  },
});
