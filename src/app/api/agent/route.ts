import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai"
import { z } from "zod"
import { agentTools, boardContextSchema, type BoardContext } from "@/agent/tools"
import { HUB } from "@/demo/flight-data"

export const maxDuration = 30

const AGENT_MODEL = process.env.AGENT_MODEL ?? "openai/gpt-4.1-mini"

// Abuse limits. In-memory per instance: good enough for a demo, swap for
// Upstash/Redis or Vercel Firewall rate limiting if this ever gets real traffic.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PROMPTS_PER_WINDOW = 8 // new questions per IP
const MAX_REQUESTS_PER_WINDOW = 60 // incl. tool round-trips per IP
const MAX_REQUESTS_PER_DAY = 1500 // whole instance
const MAX_TOOL_CALLS_PER_PROMPT = 10
const MAX_PROMPT_CHARS = 400
const MAX_MESSAGES = 40

const hits = new Map<string, { prompts: number[]; requests: number[] }>()
let day = { key: "", count: 0 }

function limited(ip: string, isPrompt: boolean): string | null {
  const now = Date.now()
  const todayKey = new Date(now).toISOString().slice(0, 10)
  if (day.key !== todayKey) day = { key: todayKey, count: 0 }
  if (day.count >= MAX_REQUESTS_PER_DAY) return "The demo agent hit its daily budget. Try again tomorrow."

  const entry = hits.get(ip) ?? { prompts: [], requests: [] }
  entry.prompts = entry.prompts.filter((t) => now - t < WINDOW_MS)
  entry.requests = entry.requests.filter((t) => now - t < WINDOW_MS)
  if (isPrompt && entry.prompts.length >= MAX_PROMPTS_PER_WINDOW) {
    return "You're asking faster than this demo allows. Wait a few minutes and try again."
  }
  if (entry.requests.length >= MAX_REQUESTS_PER_WINDOW) {
    return "Too many agent steps in a short time. Wait a few minutes and try again."
  }
  if (isPrompt) entry.prompts.push(now)
  entry.requests.push(now)
  day.count++
  hits.set(ip, entry)
  if (hits.size > 5000) hits.clear()
  return null
}

const bodySchema = z.object({
  messages: z.array(z.custom<UIMessage>((value) => typeof value === "object" && value !== null)).min(1).max(MAX_MESSAGES),
  board: boardContextSchema,
})

function fail(status: number, message: string) {
  return Response.json({ error: message }, { status })
}

function textOf(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
}

function systemPrompt(board: BoardContext): string {
  const flights = board.flights
    .map(
      (f) =>
        `- id=${f.id} | ${f.number} ${f.airline} | ${board.direction === "departures" ? "to" : "from"} ${f.city} (${f.code}) | ${f.time}${f.estimated !== f.time ? ` est ${f.estimated}` : ""} | ${f.terminal === "—" ? "" : `${f.terminal} `}gate ${f.gate} | ${f.status}`
    )
    .join("\n")
  return `You operate a flight board web page for ${HUB.city} airport, ${HUB.name} (${HUB.code}). ${HUB.code} is the default and only hub: "departures" leave ${HUB.code}, "arrivals" land at ${HUB.code}. Times are local (Europe/Bucharest).

You can only act through the provided tools, which drive the real UI controls. Each tool returns the updated board. Use as few calls as possible, then answer in one or two short sentences. Never invent flights: only mention flights listed in the board state or in tool results. If something isn't possible with the tools (booking, payments, other airports as hub, anything unrelated to this board), say so briefly.

Data: today is ${board.today}. ${board.source === "airlabs" ? `Today's flights are live schedules from AirLabs; other dates show fictional mock flights.` : "Live data is not configured, so every date shows fictional mock flights."} Say "mock" when you talk about mock flights.

Current board state:
- direction: ${board.direction}
- date: ${board.date} (${board.live ? "live" : "mock"}), allowed range ${board.dateRange[0]} to ${board.dateRange[1]}
- airport filter: ${board.airport ?? "none"}
- terminal filter: ${board.terminal}; terminal options: ${board.terminals.join(", ")}
- airport options (cities): ${board.airports.join(", ")}
- selected flight: ${board.selectedFlight ?? "none"}
- visible flights (${board.flights.length}):
${flights || "(none)"}`
}

function friendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  console.error("Agent route error:", message)
  if (/credit|billing|payment|insufficient|quota/i.test(message)) {
    return "The AI Gateway for this demo is out of credits. The scripted agent still works."
  }
  if (/oidc|unauthori[sz]ed|authentication|api key|401|403/i.test(message)) {
    return "The agent can't reach the AI Gateway (authentication isn't set up for this deployment). The scripted agent still works."
  }
  if (/rate|429|too many/i.test(message)) {
    return "The model provider is busy right now. Try again in a moment."
  }
  return "The agent hit an error. Try again, or use the scripted agent."
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return fail(400, "That request didn't look right. Reload the page and try again.")
  }

  const { messages, board } = body
  const last = messages.at(-1)
  const isPrompt = last?.role === "user"
  if (isPrompt && textOf(last).length > MAX_PROMPT_CHARS) {
    return fail(413, `Keep questions under ${MAX_PROMPT_CHARS} characters.`)
  }

  const lastUser = messages.findLastIndex((message) => message.role === "user")
  const toolCalls = messages
    .slice(lastUser + 1)
    .flatMap((message) => message.parts)
    .filter((part) => part.type.startsWith("tool-")).length
  if (toolCalls >= MAX_TOOL_CALLS_PER_PROMPT) {
    return fail(429, "The agent took too many steps for one question. Try something more specific.")
  }

  const blocked = limited(ip, isPrompt)
  if (blocked) return fail(429, blocked)

  try {
    const result = streamText({
      model: AGENT_MODEL,
      system: systemPrompt(board),
      messages: await convertToModelMessages(messages.slice(-MAX_MESSAGES), { tools: agentTools }),
      tools: agentTools,
      stopWhen: stepCountIs(1),
      maxOutputTokens: 400,
      temperature: 0,
    })
    return result.toUIMessageStreamResponse({
      onError: friendlyError,
      messageMetadata: ({ part }) => (part.type === "start" ? { model: AGENT_MODEL } : undefined),
    })
  } catch (error) {
    return fail(500, friendlyError(error))
  }
}
