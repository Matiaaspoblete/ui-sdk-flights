import { cacheLife } from "next/cache"
import {
  HUB,
  HUB_TIME_ZONE,
  airportByCode,
  formatDuration,
  seatFor,
  todayIn,
  type Direction,
  type Flight,
  type FlightStatus,
} from "@/demo/flight-data"
import departuresFixture from "./fixtures/airlabs-clj-departures.json"
import arrivalsFixture from "./fixtures/airlabs-clj-arrivals.json"

export type BoardSource = "airlabs" | "demo"

export type Board = {
  today: string
  source: BoardSource
  fetchedAt: string | null
  flights: Flight[]
  note: string | null
}

type AirlabsSchedule = {
  airline_iata?: string | null
  flight_iata?: string | null
  flight_number?: string | null
  dep_iata?: string | null
  dep_terminal?: string | null
  dep_gate?: string | null
  dep_time?: string | null
  dep_estimated?: string | null
  dep_delayed?: number | null
  arr_iata?: string | null
  arr_terminal?: string | null
  arr_gate?: string | null
  arr_time?: string | null
  arr_estimated?: string | null
  arr_delayed?: number | null
  cs_flight_iata?: string | null
  aircraft_icao?: string | null
  duration?: number | null
  status?: string | null
}

const AIRLINES: Record<string, string> = {
  "0B": "Blue Air",
  "3U": "Sichuan Airlines",
  A3: "Aegean",
  AF: "Air France",
  AY: "Finnair",
  AZ: "ITA Airways",
  BA: "British Airways",
  DY: "Norwegian",
  EK: "Emirates",
  EW: "Eurowings",
  FB: "Bulgaria Air",
  FR: "Ryanair",
  FZ: "flydubai",
  H4: "HiSky",
  IB: "Iberia",
  JU: "Air Serbia",
  KL: "KLM",
  LH: "Lufthansa",
  LO: "LOT",
  LX: "SWISS",
  OS: "Austrian",
  PC: "Pegasus",
  QR: "Qatar Airways",
  RO: "TAROM",
  SK: "SAS",
  SN: "Brussels Airlines",
  TK: "Turkish Airlines",
  TP: "TAP Air Portugal",
  U2: "easyJet",
  VY: "Vueling",
  W4: "Wizz Air Malta",
  W6: "Wizz Air",
  "5W": "Wizz Air Abu Dhabi",
}

// Two airports × one refresh every 2 h ≈ 720 calls a month, under AirLabs' free 1,000.
const LIVE_REVALIDATE_SECONDS = 2 * 60 * 60
const AIRLABS_URL = "https://airlabs.co/api/v9/schedules"

function clock(value: string | null | undefined): string | null {
  const match = value?.match(/\s(\d{2}:\d{2})/)
  return match?.[1] ?? null
}

function addClockMinutes(time: string, minutes: number): string {
  const [hours = 0, mins = 0] = time.split(":").map(Number)
  const total = (((hours * 60 + mins + minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function statusFor(direction: Direction, raw: string | null | undefined, delay: number): FlightStatus {
  if (raw === "cancelled") return "Cancelled"
  if (direction === "departures") {
    if (raw === "active" || raw === "landed") return "Departed"
  } else if (raw === "landed") {
    return "Landed"
  }
  return delay >= 15 ? "Delayed" : "On time"
}

export function mapAirlabsSchedules(rows: AirlabsSchedule[], direction: Direction): Flight[] {
  const flights: Flight[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    if (row.cs_flight_iata) continue
    const departing = direction === "departures"
    const scheduled = clock(departing ? row.dep_time : row.arr_time)
    const code = departing ? row.arr_iata : row.dep_iata
    if (!scheduled || !code || !row.flight_iata) continue
    const id = `${row.flight_iata}-${direction}-${scheduled.replace(":", "")}`
    if (seen.has(id)) continue
    seen.add(id)
    const delay = (departing ? row.dep_delayed : row.arr_delayed) ?? 0
    const estimated =
      clock(departing ? row.dep_estimated : row.arr_estimated) ??
      (delay > 0 ? addClockMinutes(scheduled, delay) : scheduled)
    const terminal = departing ? row.dep_terminal : row.arr_terminal
    const airline = row.airline_iata ?? ""
    flights.push({
      id,
      number: `${airline} ${row.flight_number ?? row.flight_iata.slice(airline.length)}`.trim(),
      airline: AIRLINES[airline] ?? airline,
      direction,
      airport: airportByCode(code),
      scheduled,
      estimated,
      terminal: terminal ? `T${terminal.replace(/^T/i, "")}` : "—",
      gate: (departing ? row.dep_gate : row.arr_gate) ?? "—",
      status: statusFor(direction, row.status, delay),
      aircraft: row.aircraft_icao ?? "—",
      duration: row.duration ? formatDuration(row.duration) : "—",
      ...seatFor(id),
    })
  }
  return flights.sort((a, b) => a.scheduled.localeCompare(b.scheduled))
}

async function fetchSchedules(param: "dep_iata" | "arr_iata", key: string): Promise<AirlabsSchedule[]> {
  const url = new URL(AIRLABS_URL)
  url.searchParams.set(param, HUB.code)
  url.searchParams.set("limit", "50")
  url.searchParams.set("api_key", key)
  // AirLabs answers 403 to requests without a User-Agent it recognises.
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "ui-sdk-flights/1.0" },
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`AirLabs ${param} answered ${response.status}`)
  const body: { response?: unknown; error?: { message?: string } } = await response.json()
  if (!Array.isArray(body.response)) {
    throw new Error(`AirLabs ${param}: ${body.error?.message ?? "unexpected response"}`)
  }
  return body.response as AirlabsSchedule[]
}

export async function getBoard(): Promise<Board> {
  "use cache"
  const now = new Date()
  const today = todayIn(HUB_TIME_ZONE, now)
  const demo = (note: string): Board => ({ today, source: "demo", fetchedAt: null, flights: [], note })

  if (process.env.AIRLABS_FIXTURE === "1") {
    cacheLife({ stale: 60, revalidate: 60, expire: 300 })
    return {
      today,
      source: "airlabs",
      fetchedAt: now.toISOString(),
      flights: [
        ...mapAirlabsSchedules(departuresFixture.response, "departures"),
        ...mapAirlabsSchedules(arrivalsFixture.response, "arrivals"),
      ],
      note: "AirLabs fixture",
    }
  }

  const key = process.env.AIRLABS_API_KEY
  if (!key) {
    cacheLife({ stale: 300, revalidate: 3600, expire: 86400 })
    return demo("Set AIRLABS_API_KEY for live schedules.")
  }

  try {
    const [departures, arrivals] = await Promise.all([
      fetchSchedules("dep_iata", key),
      fetchSchedules("arr_iata", key),
    ])
    const flights = [
      ...mapAirlabsSchedules(departures, "departures"),
      ...mapAirlabsSchedules(arrivals, "arrivals"),
    ]
    if (flights.length === 0) throw new Error("AirLabs returned no flights")
    cacheLife({ stale: 300, revalidate: LIVE_REVALIDATE_SECONDS, expire: 86400 })
    return { today, source: "airlabs", fetchedAt: now.toISOString(), flights, note: null }
  } catch (error) {
    console.error("Live schedules unavailable:", error instanceof Error ? error.message : error)
    cacheLife({ stale: 300, revalidate: 900, expire: 86400 })
    return demo("Live schedules are unavailable right now.")
  }
}
