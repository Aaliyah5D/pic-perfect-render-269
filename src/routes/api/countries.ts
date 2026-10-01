import { createFileRoute } from "@tanstack/react-router";
import { listCountries } from "@/lib/senda.server";

export const Route = createFileRoute("/api/countries")({
  server: {
    handlers: {
      GET: async () => Response.json({ countries: listCountries() }),
    },
  },
});
