export type Direction = "departures" | "arrivals"
export type Terminal = string
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
  code: "CLJ",
  city: "Cluj-Napoca",
  name: "Avram Iancu Intl.",
}

export const HUB_TIME_ZONE = "Europe/Bucharest"

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

const KNOWN_AIRPORTS: Airport[] = [
  ...AIRPORTS,
  HUB,
  { code: "BBU", city: "Bucharest", name: "Băneasa" },
  { code: "OTP", city: "Bucharest", name: "Henri Coandă" },
  { code: "IAS", city: "Iași", name: "Iași Intl." },
  { code: "TSR", city: "Timișoara", name: "Traian Vuia" },
  { code: "SBZ", city: "Sibiu", name: "Sibiu Intl." },
  { code: "SCV", city: "Suceava", name: "Ștefan cel Mare" },
  { code: "OMR", city: "Oradea", name: "Oradea Intl." },
  { code: "CND", city: "Constanța", name: "Mihail Kogălniceanu" },
  { code: "BCM", city: "Bacău", name: "George Enescu" },
  { code: "CRA", city: "Craiova", name: "Craiova Intl." },
  { code: "TGM", city: "Târgu Mureș", name: "Transilvania" },
  { code: "LTN", city: "London", name: "Luton" },
  { code: "STN", city: "London", name: "Stansted" },
  { code: "LGW", city: "London", name: "Gatwick" },
  { code: "BVA", city: "Paris", name: "Beauvais" },
  { code: "ORY", city: "Paris", name: "Orly" },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt am Main" },
  { code: "DUS", city: "Düsseldorf", name: "Düsseldorf" },
  { code: "BER", city: "Berlin", name: "Brandenburg" },
  { code: "HAM", city: "Hamburg", name: "Hamburg" },
  { code: "CGN", city: "Cologne", name: "Köln Bonn" },
  { code: "STR", city: "Stuttgart", name: "Stuttgart" },
  { code: "NUE", city: "Nuremberg", name: "Nürnberg" },
  { code: "MXP", city: "Milan", name: "Malpensa" },
  { code: "BGY", city: "Milan", name: "Bergamo" },
  { code: "LIN", city: "Milan", name: "Linate" },
  { code: "CIA", city: "Rome", name: "Ciampino" },
  { code: "BLQ", city: "Bologna", name: "Guglielmo Marconi" },
  { code: "VCE", city: "Venice", name: "Marco Polo" },
  { code: "TSF", city: "Venice", name: "Treviso" },
  { code: "NAP", city: "Naples", name: "Capodichino" },
  { code: "TRN", city: "Turin", name: "Caselle" },
  { code: "BRU", city: "Brussels", name: "Brussels" },
  { code: "CRL", city: "Brussels", name: "Charleroi" },
  { code: "EIN", city: "Eindhoven", name: "Eindhoven" },
  { code: "DUB", city: "Dublin", name: "Dublin" },
  { code: "CPH", city: "Copenhagen", name: "Kastrup" },
  { code: "ARN", city: "Stockholm", name: "Arlanda" },
  { code: "OSL", city: "Oslo", name: "Gardermoen" },
  { code: "HEL", city: "Helsinki", name: "Helsinki-Vantaa" },
  { code: "WAW", city: "Warsaw", name: "Chopin" },
  { code: "WMI", city: "Warsaw", name: "Modlin" },
  { code: "KRK", city: "Kraków", name: "John Paul II" },
  { code: "PRG", city: "Prague", name: "Václav Havel" },
  { code: "BUD", city: "Budapest", name: "Ferenc Liszt" },
  { code: "SOF", city: "Sofia", name: "Sofia" },
  { code: "BEG", city: "Belgrade", name: "Nikola Tesla" },
  { code: "KIV", city: "Chișinău", name: "Chișinău Intl." },
  { code: "SKG", city: "Thessaloniki", name: "Makedonia" },
  { code: "LCA", city: "Larnaca", name: "Larnaca" },
  { code: "TLV", city: "Tel Aviv", name: "Ben Gurion" },
  { code: "SAW", city: "Istanbul", name: "Sabiha Gökçen" },
  { code: "AYT", city: "Antalya", name: "Antalya" },
  { code: "DXB", city: "Dubai", name: "Dubai Intl." },
  { code: "DWC", city: "Dubai", name: "Al Maktoum" },
  { code: "DOH", city: "Doha", name: "Hamad" },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed" },
  { code: "CAI", city: "Cairo", name: "Cairo Intl." },
  { code: "HRG", city: "Hurghada", name: "Hurghada" },
  { code: "SSH", city: "Sharm el-Sheikh", name: "Sharm el-Sheikh" },
  { code: "TFS", city: "Tenerife", name: "Tenerife South" },
  { code: "AGP", city: "Málaga", name: "Málaga" },
  { code: "VLC", city: "Valencia", name: "Valencia" },
  { code: "OPO", city: "Porto", name: "Francisco Sá Carneiro" },
  { code: "NCE", city: "Nice", name: "Côte d'Azur" },
  { code: "LYS", city: "Lyon", name: "Saint-Exupéry" },
  { code: "MRS", city: "Marseille", name: "Provence" },
  { code: "GVA", city: "Geneva", name: "Geneva" },
  { code: "BSL", city: "Basel", name: "EuroAirport" },
  { code: "JFK", city: "New York", name: "John F. Kennedy" },
  { code: "TIA", city: "Tirana", name: "Nënë Tereza" },
  { code: "ARW", city: "Arad", name: "Arad" },
  { code: "BAY", city: "Baia Mare", name: "Baia Mare" },
  { code: "ZAZ", city: "Zaragoza", name: "Zaragoza" },
  { code: "PEK", city: "Beijing", name: "Capital" },
  { code: "LCY", city: "London", name: "City" },
  { code: "SVQ", city: "Seville", name: "Seville" },
  { code: "PMI", city: "Palma", name: "Palma de Mallorca" },
  { code: "ALC", city: "Alicante", name: "Alicante-Elche" },
  { code: "CTA", city: "Catania", name: "Fontanarossa" },
  { code: "BRI", city: "Bari", name: "Karol Wojtyła" },
  { code: "PSA", city: "Pisa", name: "Galileo Galilei" },
  { code: "FMM", city: "Memmingen", name: "Allgäu" },
  { code: "DTM", city: "Dortmund", name: "Dortmund" },
  { code: "FKB", city: "Karlsruhe", name: "Baden-Baden" },
  { code: "HHN", city: "Frankfurt", name: "Hahn" },
  { code: "BLL", city: "Billund", name: "Billund" },
  { code: "MMX", city: "Malmö", name: "Malmö" },
  { code: "BHX", city: "Birmingham", name: "Birmingham" },
  { code: "LBA", city: "Leeds", name: "Leeds Bradford" },
  { code: "DSA", city: "Doncaster", name: "Sheffield" },
  { code: "KTW", city: "Katowice", name: "Pyrzowice" },
]

export function airportByCode(code: string): Airport {
  return (
    KNOWN_AIRPORTS.find((airport) => airport.code === code) ?? {
      code,
      city: code,
      name: code,
    }
  )
}

export function addDays(date: string, days: number): string {
  const parsed = new Date(`${date}T12:00:00Z`)
  parsed.setUTCDate(parsed.getUTCDate() + days)
  return parsed.toISOString().slice(0, 10)
}

export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

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

export function hash(text: string): number {
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

export function flightsFor(date: string, today: string): Flight[] {
  const daySeed = hash(date)
  const counters: Record<Direction, number> = { departures: 0, arrivals: 0 }

  return TEMPLATES.map((template) => {
    const seed = hash(`${date}-${template.prefix}${template.num}`)
    const index = counters[template.direction]++
    const statuses = template.direction === "departures" ? DEPARTURE_STATUSES : ARRIVAL_STATUSES
    const isToday = date === today
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

export function seatFor(seed: string): { seat: string; group: string } {
  const value = hash(seed)
  return {
    seat: `${4 + (value % 26)}${"ACDF"[value % 4] ?? "A"}`,
    group: String(1 + (value % 4)),
  }
}

export function formatDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`
}
