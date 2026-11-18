import { tool } from "ai"
import { z } from "zod"

// Client-side tools: no `execute`, so the browser runs each call through
// UI SDK `agent.act()` and the allow-list, then reports the outcome back.
export const agentTools = {
  set_direction: tool({
    description: "Switch the board between departures and arrivals.",
    inputSchema: z.object({ direction: z.enum(["departures", "arrivals"]) }),
  }),
  set_airport: tool({
    description:
      "Filter the board to one destination/origin airport by city name as listed in the airport options, e.g. 'Lisbon'.",
    inputSchema: z.object({ city: z.string().min(1).max(40) }),
  }),
  set_date: tool({
    description: "Pick the board date (YYYY-MM-DD) within the allowed range.",
    inputSchema: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  }),
  set_terminal: tool({
    description: "Filter by terminal using one of the listed terminal labels, e.g. 'Terminal 2' or 'All terminals'.",
    inputSchema: z.object({ terminal: z.string().min(1).max(30) }),
  }),
  select_flight: tool({
    description:
      "Open a flight's details by its id from the visible flights. Only flights visible on the current board can be selected.",
    inputSchema: z.object({ flightId: z.string().min(1).max(40) }),
  }),
  open_boarding_pass: tool({
    description: "Open the mock boarding pass for the selected flight.",
    inputSchema: z.object({}),
  }),
}

export type AgentToolName = keyof typeof agentTools

export const boardContextSchema = z.object({
  today: z.string().max(10),
  source: z.enum(["airlabs", "demo"]),
  direction: z.enum(["departures", "arrivals"]),
  date: z.string().max(10),
  dateRange: z.tuple([z.string().max(10), z.string().max(10)]),
  live: z.boolean(),
  airport: z.string().max(40).nullable(),
  terminal: z.string().max(30),
  terminals: z.array(z.string().max(30)).max(10),
  airports: z.array(z.string().max(40)).max(80),
  selectedFlight: z.string().max(40).nullable(),
  flights: z
    .array(
      z.object({
        id: z.string().max(40),
        number: z.string().max(12),
        airline: z.string().max(40),
        city: z.string().max(40),
        code: z.string().max(4),
        time: z.string().max(5),
        estimated: z.string().max(5),
        terminal: z.string().max(6),
        gate: z.string().max(6),
        status: z.string().max(20),
      })
    )
    .max(40),
})

export type BoardContext = z.infer<typeof boardContextSchema>
