export type Direction = "departures" | "arrivals"
export type Terminal = "T1" | "T2"
export type FlightStatus =
  | "On time"
  | "Boarding"
  | "Gate closing"
  | "Delayed"
  | "Departed"
  | "Landed"
  | "Cancelled"

export type Airport = {
  code: string
  city: string
  name: string
}

export type Flight = {
  id: string
  number: string
  airline: string
  direction: Direction
  airport: Airport
  scheduled: string
  estimated: string
  terminal: Terminal
  gate: string
  status: FlightStatus
  aircraft: string
  duration: string
  seat: string
  group: string
}

export const HUB: Airport = {
  code: "OTP",
  city: "Bucharest",
  name: "Henri Coandă Intl.",
}

export const DEMO_DATE = "2026-11-19"
export const DEMO_MIN_DATE = "2026-11-16"
export const DEMO_MAX_DATE = "2026-12-31"

export const AIRPORTS: Airport[] = [
  { code: "LIS", city: "Lisbon", name: "Humberto Delgado" },
  { code: "AMS", city: "Amsterdam", name: "Schiphol" },
  { code: "BCN", city: "Barcelona", name: "El Prat" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle" },
  { code: "FCO", city: "Rome", name: "Fiumicino" },
  { code: "LHR", city: "London", name: "Heathrow" },
  { code: "MAD", city: "Madrid", name: "Barajas" },
  { code: "MUC", city: "Munich", name: "Franz Josef Strauss" },
  { code: "VIE", city: "Vienna", name: "Schwechat" },
  { code: "IST", city: "Istanbul", name: "Istanbul Airport" },
  { code: "ATH", city: "Athens", name: "Eleftherios Venizelos" },
  { code: "ZRH", city: "Zurich", name: "Kloten" },
]

type Template = {
  airline: string
  prefix: string
  num: number
  city: string
  direction: Direction
  time: string
  terminal: Terminal
  gate: string
  aircraft: string
  duration: string
}

const TEMPLATES: Template[] = [
  { airline: "Nimbus Air", prefix: "NB", num: 412, city: "Lisbon", direction: "departures", time: "06:40", terminal: "T2", gate: "B12", aircraft: "A321neo", duration: "4h 05m" },
  { airline: "Aurora", prefix: "AU", num: 118, city: "Amsterdam", direction: "departures", time: "07:15", terminal: "T1", gate: "A04", aircraft: "737 MAX 8", duration: "2h 55m" },
  { airline: "Meridian", prefix: "MR", num: 903, city: "Paris", direction: "departures", time: "08:05", terminal: "T2", gate: "B07", aircraft: "A320", duration: "3h 10m" },
  { airline: "Nimbus Air", prefix: "NB", num: 220, city: "London", direction: "departures", time: "09:30", terminal: "T2", gate: "B15", aircraft: "A321neo", duration: "3h 35m" },
  { airline: "Halcyon", prefix: "HY", num: 57, city: "Istanbul", direction: "departures", time: "10:20", terminal: "T1", gate: "A09", aircraft: "A220-300", duration: "1h 40m" },
  { airline: "Aurora", prefix: "AU", num: 640, city: "Munich", direction: "departures", time: "11:45", terminal: "T1", gate: "A02", aircraft: "737-800", duration: "2h 10m" },
  { airline: "Meridian", prefix: "MR", num: 311, city: "Barcelona", direction: "departures", time: "13:10", terminal: "T2", gate: "B03", aircraft: "A320neo", duration: "3h 25m" },
  { airline: "Nimbus Air", prefix: "NB", num: 418, city: "Lisbon", direction: "departures", time: "15:55", terminal: "T2", gate: "B10", aircraft: "A321neo", duration: "4h 05m" },
  { airline: "Halcyon", prefix: "HY", num: 702, city: "Athens", direction: "departures", time: "17:20", terminal: "T1", gate: "A11", aircraft: "E195-E2", duration: "1h 35m" },
  { airline: "Aurora", prefix: "AU", num: 905, city: "Vienna", direction: "departures", time: "19:05", terminal: "T1", gate: "A06", aircraft: "A220-100", duration: "1h 25m" },
  { airline: "Meridian", prefix: "MR", num: 145, city: "Rome", direction: "departures", time: "20:40", terminal: "T2", gate: "B05", aircraft: "A320", duration: "2h 15m" },
  { airline: "Nimbus Air", prefix: "NB", num: 413, city: "Lisbon", direction: "arrivals", time: "06:10", terminal: "T2", gate: "B12", aircraft: "A321neo", duration: "4h 00m" },
  { airline: "Aurora", prefix: "AU", num: 119, city: "Amsterdam", direction: "arrivals", time: "08:50", terminal: "T1", gate: "A04", aircraft: "737 MAX 8", duration: "2h 50m" },
  { airline: "Meridian", prefix: "MR", num: 904, city: "Madrid", direction: "arrivals", time: "10:35", terminal: "T2", gate: "B08", aircraft: "A320", duration: "3h 50m" },
  { airline: "Halcyon", prefix: "HY", num: 58, city: "Istanbul", direction: "arrivals", time: "12:15", terminal: "T1", gate: "A09", aircraft: "A220-300", duration: "1h 45m" },
  { airline: "Aurora", prefix: "AU", num: 641, city: "Zurich", direction: "arrivals", time: "14:25", terminal: "T1", gate: "A03", aircraft: "737-800", duration: "2h 20m" },
  { airline: "Nimbus Air", prefix: "NB", num: 221, city: "London", direction: "arrivals", time: "16:40", terminal: "T2", gate: "B15", aircraft: "A321neo", duration: "3h 30m" },
  { airline: "Meridian", prefix: "MR", num: 312, city: "Barcelona", direction: "arrivals", time: "18:55", terminal: "T2", gate: "B03", aircraft: "A320neo", duration: "3h 20m" },
  { airline: "Halcyon", prefix: "HY", num: 703, city: "Athens", direction: "arrivals", time: "21:30", terminal: "T1", gate: "A11", aircraft: "E195-E2", duration: "1h 30m" },
]

function hash(text: string): number {
  let value = 2166136261
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

function addMinutes(time: string, minutes: number): string {
  const [hours = 0, mins = 0] = time.split(":").map(Number)
  const total = (hours * 60 + mins + minutes + 24 * 60) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

const DEPARTURE_STATUSES: FlightStatus[] = ["Departed", "Departed", "Boarding", "Gate closing", "On time", "Delayed", "On time", "On time", "On time", "On time", "On time"]
const ARRIVAL_STATUSES: FlightStatus[] = ["Landed", "Landed", "Landed", "Delayed", "On time", "On time", "On time", "On time"]

export function airportByCity(city: string): Airport {
  return AIRPORTS.find((airport) => airport.city === city) ?? HUB
}

export function flightsFor(date: string): Flight[] {
  const daySeed = hash(date)
  const counters: Record<Direction, number> = { departures: 0, arrivals: 0 }

  return TEMPLATES.map((template) => {
    const seed = hash(`${date}-${template.prefix}${template.num}`)
    const index = counters[template.direction]++
    const statuses = template.direction === "departures" ? DEPARTURE_STATUSES : ARRIVAL_STATUSES
    const isToday = date === DEMO_DATE
    let status: FlightStatus = isToday ? statuses[index] ?? "On time" : "On time"
    if (!isToday && seed % 9 === 0) status = "Delayed"
    if (seed % 37 === 0 && template.city !== "Lisbon") status = "Cancelled"
    const shift = ((daySeed >> 3) % 3) * 5
    const scheduled = addMinutes(template.time, shift)
    const delay = status === "Delayed" ? 15 + (seed % 4) * 10 : 0
    const row = 4 + (seed % 26)
    const letter = "ACDF"[seed % 4] ?? "A"

    return {
      id: `${template.prefix}${template.num}`,
      number: `${template.prefix} ${template.num}`,
      airline: template.airline,
      direction: template.direction,
      airport: airportByCity(template.city),
      scheduled,
      estimated: addMinutes(scheduled, delay),
      terminal: template.terminal,
      gate: template.gate,
      status,
      aircraft: template.aircraft,
      duration: template.duration,
      seat: `${row}${letter}`,
      group: String(1 + (seed % 4)),
    }
  })
}

export function formatDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00Z`)
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(parsed)
}
