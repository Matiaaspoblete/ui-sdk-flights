"use client"

import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@ui-sdk/react/combobox"
import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { Listbox, ListboxItem } from "@ui-sdk/react/listbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@ui-sdk/react/tabs"
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlaneLandingIcon,
  PlaneTakeoffIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { BoardContext } from "@/agent/tools"
import { AgentPanel, type LogEntry } from "./agent-panel"
import { AskAgent, type AgentStep } from "./ask-agent"
import { ALLOWED_ACTIONS, getAgent } from "./agent"
import { BoardingPass } from "./boarding-pass"
import type { Board as LiveBoard } from "@/server/flights"
import {
  AIRPORTS,
  HUB,
  addDays,
  flightsFor,
  formatDate,
  type Direction,
  type Flight,
  type FlightStatus,
} from "./flight-data"

type TerminalFilter = string
type Target = "board" | "airport" | "date" | "terminal" | "list" | "pass"

function terminalOptions(flights: Flight[]): { value: TerminalFilter; label: string }[] {
  const terminals = [...new Set(flights.map((flight) => flight.terminal))]
    .filter((terminal) => terminal !== "—")
    .sort()
  return [
    { value: "all", label: "All terminals" },
    ...terminals.map((terminal) => ({
      value: terminal,
      label: `Terminal ${terminal.replace(/^T/, "")}`,
    })),
  ]
}

const STATUS_TONE: Record<FlightStatus, string> = {
  "On time": "neutral",
  Boarding: "green",
  "Gate closing": "amber",
  Delayed: "amber",
  Departed: "muted",
  Landed: "muted",
  Cancelled: "red",
}


const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

function StatusBadge({ status }: { status: FlightStatus }) {
  return (
    <span className="lab-status" data-tone={STATUS_TONE[status]}>
      <span className="lab-dot" aria-hidden="true" />
      {status}
    </span>
  )
}

function Board({
  direction,
  flights,
  selected,
  onSelect,
}: {
  direction: Direction
  flights: Flight[]
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const label = direction === "departures" ? "Departures board" : "Arrivals board"

  return (
    <div className="lab-board">
      <div className="lab-board-head" aria-hidden="true">
        <span>Time</span>
        <span>Flight</span>
        <span>{direction === "departures" ? "To" : "From"}</span>
        <span>Gate</span>
        <span>Status</span>
      </div>
      {flights.length === 0 ? (
        <p className="lab-empty">No flights match these filters.</p>
      ) : (
        <Listbox
          aria-label={label}
          className="lab-listbox"
          activation="automatic"
          value={selected}
          onValueChange={(value) => onSelect(value)}
        >
          {flights.map((flight, index) => (
            <ListboxItem
              key={flight.id}
              value={flight.id}
              label={`${flight.number} ${flight.airport.city}`}
              className="lab-row"
              style={{ "--i": index } as React.CSSProperties}
            >
              <span className="lab-time">
                <span data-late={flight.estimated !== flight.scheduled || undefined}>
                  {flight.scheduled}
                </span>
                {flight.estimated !== flight.scheduled && (
                  <span className="lab-estimated">{flight.estimated}</span>
                )}
              </span>
              <span className="lab-flight">
                <span className="lab-mono">{flight.number}</span>
                <span className="lab-muted lab-small">{flight.airline}</span>
              </span>
              <span className="lab-city">
                {flight.airport.city}
                <span className="lab-muted lab-mono lab-small">
                  {flight.airport.code}
                </span>
              </span>
              <span className="lab-mono">
                {flight.terminal === "—" ? flight.gate : `${flight.terminal} · ${flight.gate}`}
              </span>
              <StatusBadge status={flight.status} />
            </ListboxItem>
          ))}
        </Listbox>
      )}
    </div>
  )
}

export function FlightDemo({ board }: { board: LiveBoard }) {
  const today = board.today
  const live = board.source === "airlabs"
  const agentDate = addDays(today, 2)
  const [direction, setDirection] = useState<Direction>("departures")
  const [airport, setAirport] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(today)
  const [terminal, setTerminal] = useState<TerminalFilter>("all")
  const [selected, setSelected] = useState<string | null>(null)
  const [passOpen, setPassOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const runId = useRef(0)

  const day = date ?? today
  const liveDay = live && day === today
  const flights = useMemo(
    () => (liveDay ? board.flights : flightsFor(day, today)),
    [liveDay, board.flights, day, today]
  )
  const airports = useMemo(() => {
    const byCode = new Map(AIRPORTS.map((item) => [item.code, item]))
    if (liveDay) for (const flight of flights) byCode.set(flight.airport.code, flight.airport)
    return [...byCode.values()].sort((a, b) => a.city.localeCompare(b.city))
  }, [liveDay, flights])
  const terminals = useMemo(() => terminalOptions(flights), [flights])
  const terminalFilter = terminals.some((item) => item.value === terminal) ? terminal : "all"
  const visible = (dir: Direction) =>
    flights.filter(
      (flight) =>
        flight.direction === dir &&
        (airport === null || flight.airport.code === airport) &&
        (terminalFilter === "all" || flight.terminal === terminalFilter)
    )
  const selectedFlight = flights.find((flight) => flight.id === selected) ?? null
  const logSeq = useRef(0)

  const context: BoardContext = {
    today,
    source: board.source,
    direction,
    date: day,
    dateRange: [addDays(today, -1), addDays(today, 7)],
    live: liveDay,
    airport: airports.find((item) => item.code === airport)?.city ?? null,
    terminal: terminals.find((item) => item.value === terminalFilter)?.label ?? "All terminals",
    terminals: terminals.map((item) => item.label),
    airports: airports.map((item) => item.city).filter((city, i, all) => all.indexOf(city) === i).slice(0, 80),
    selectedFlight: selected,
    flights: visible(direction)
      .slice(0, 40)
      .map((flight) => ({
        id: flight.id,
        number: flight.number,
        airline: flight.airline.slice(0, 40),
        city: flight.airport.city,
        code: flight.airport.code,
        time: flight.scheduled,
        estimated: flight.estimated,
        terminal: flight.terminal,
        gate: flight.gate,
        status: flight.status,
      })),
  }
  const contextRef = useRef(context)
  useEffect(() => {
    contextRef.current = context
  })

  async function actStep(text: string, nextTarget: Target, step: AgentStep) {
    const id = `ask-${logSeq.current++}`
    setTarget(nextTarget)
    setLog((entries) => [...entries, { id, text, call: step, state: "running" }])
    await sleep(350)
    const result = await getAgent().act({ steps: [step] })
    setLog((entries) =>
      entries.map((entry) =>
        entry.id === id
          ? { ...entry, state: result.ok ? "done" : "failed", error: result.error?.message }
          : entry
      )
    )
    await sleep(200)
    setTarget(null)
    return { ok: result.ok, error: result.error?.message }
  }

  useEffect(() => {
    getAgent()
  }, [])

  function reset() {
    runId.current++
    setRunning(false)
    setTarget(null)
    setPassOpen(false)
    setDirection("departures")
    setAirport(null)
    setDate(today)
    setTerminal("all")
    setSelected(null)
    setLog([])
  }

  async function runAgent() {
    reset()
    setDirection("arrivals")
    const id = runId.current
    setRunning(true)
    const agent = getAgent()
    await sleep(500)

    const update = (index: number, patch: Partial<LogEntry>) =>
      setLog((entries) =>
        entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry))
      )

    type Plan = {
      target: Target
      text: string
      step: () => Promise<{ ref: string; action: string; args?: unknown[] }>
    }

    const plan: Plan[] = [
      {
        target: "board",
        text: "Switch the board to departures",
        step: async () => ({ ref: "Direction", action: "setValue", args: ["departures"] }),
      },
      {
        target: "airport",
        text: "Set destination to Lisbon",
        step: async () => ({ ref: "Airport", action: "setValue", args: ["Lisbon"] }),
      },
      {
        target: "date",
        text: `Pick ${formatDate(agentDate)}`,
        step: async () => ({ ref: "Date", action: "setValue", args: [agentDate] }),
      },
      {
        target: "terminal",
        text: "Filter to Terminal 2",
        step: async () => ({ ref: "Terminal", action: "setValue", args: ["Terminal 2"] }),
      },
      {
        target: "list",
        text: "Open the first Lisbon flight",
        step: async () => {
          const found = await agent.query({ within: "Departures board", text: "Lisbon" })
          const first = "error" in found ? undefined : found[0]?.items?.[0]
          return { ref: "Departures board", action: "setValue", args: [first?.value ?? ""] }
        },
      },
      {
        target: "pass",
        text: "Open the boarding pass",
        step: async () => ({ ref: "View boarding pass", action: "press" }),
      },
    ]

    for (const [index, item] of plan.entries()) {
      if (runId.current !== id) return
      setTarget(item.target)
      const step = await item.step()
      setLog((entries) => [
        ...entries,
        { id: `${id}-${index}`, text: item.text, call: step, state: "running" },
      ])
      await sleep(650)
      if (runId.current !== id) return
      const result = await agent.act({ steps: [step] })
      update(index, {
        state: result.ok ? "done" : "failed",
        error: result.error?.message,
      })
      if (!result.ok) break
      await sleep(900)
    }
    if (runId.current === id) {
      setTarget(null)
      setRunning(false)
    }
  }

  return (
    <div className="lab-demo">
      <section className="lab-hero">
        <div>
          <p className="lab-eyebrow">
            <span className="lab-pill">UI SDK beta</span>
            <span className="lab-muted">
              {live ? "Live today via AirLabs" : "Mock data"} · {HUB.name} ({HUB.code})
            </span>
          </p>
          <h1 className="lab-title">Departures, operable by agents.</h1>
          <p className="lab-lede">
            A flight board built with Vercel&apos;s UI SDK. People drive every
            control with the keyboard; an agent drives the same components through{" "}
            <code>createAgent</code>, no mouse simulation.
          </p>
        </div>
        <div className="lab-hero-actions">
          <button
            type="button"
            className="lab-button lab-button-primary"
            onClick={runAgent}
            disabled={running}
            data-agent-hidden=""
          >
            <SparklesIcon aria-hidden="true" size={15} />
            {running ? "Agent running…" : "Let an agent do it"}
          </button>
          <button
            type="button"
            className="lab-button lab-button-secondary"
            onClick={reset}
            data-agent-hidden=""
          >
            Reset
          </button>
        </div>
      </section>

      <AskAgent
        getBoard={() => contextRef.current}
        act={actStep}
        onStart={() => {
          runId.current++
          setRunning(false)
          setPassOpen(false)
          setLog([])
        }}
      />

      <section className="lab-filters" aria-label="Filters">
        <div className="lab-field" data-agent-target={target === "airport" || undefined}>
          <Combobox
            value={airport}
            onValueChange={(value) => setAirport(value)}
          >
            <ComboboxLabel className="lab-label">Airport</ComboboxLabel>
            <div className="lab-input-row">
              <ComboboxInput className="lab-input" placeholder="Search city or code" />
              <ComboboxClear className="lab-icon-button" aria-label="Clear airport">
                <XIcon aria-hidden="true" size={14} />
              </ComboboxClear>
              <ComboboxTrigger className="lab-icon-button" aria-label="Show airports">
                <ChevronDownIcon aria-hidden="true" size={14} />
              </ComboboxTrigger>
            </div>
            <ComboboxContent className="lab-popup" sideOffset={6} align="start">
              <ComboboxEmpty className="lab-empty">No airports found.</ComboboxEmpty>
              <ComboboxList className="lab-options">
                {airports.map((item) => (
                  <ComboboxItem
                    key={item.code}
                    value={item.code}
                    label={item.city}
                    keywords={[item.code, item.name]}
                    className="lab-option"
                  >
                    <span>{item.city}</span>
                    <span className="lab-muted lab-mono lab-small" aria-hidden="true">
                      {item.code}
                    </span>
                    <ComboboxItemIndicator className="lab-check">
                      <CheckIcon aria-hidden="true" size={14} />
                    </ComboboxItemIndicator>
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="lab-field" data-agent-target={target === "date" || undefined}>
          <span className="lab-label" id="lab-date-label">
            Date
          </span>
          <DatePicker
            value={date}
            onValueChange={(value) => setDate(typeof value === "string" ? value : null)}
            min={addDays(today, -1)}
            max={addDays(today, 7)}
            locale="en-GB"
          >
            <div className="lab-input-row">
              <DatePickerInput className="lab-input" aria-label="Date" />
              <DatePickerTrigger className="lab-icon-button" aria-label="Open calendar">
                <CalendarIcon aria-hidden="true" size={14} />
              </DatePickerTrigger>
            </div>
            <DatePickerContent className="lab-popup lab-calendar" sideOffset={6} align="start">
              <div className="lab-calendar-head">
                <CalendarPrevious className="lab-icon-button" aria-label="Previous month">
                  <ChevronLeftIcon aria-hidden="true" size={14} />
                </CalendarPrevious>
                <CalendarHeading className="lab-calendar-title" />
                <CalendarNext className="lab-icon-button" aria-label="Next month">
                  <ChevronRightIcon aria-hidden="true" size={14} />
                </CalendarNext>
              </div>
              <CalendarGrid className="lab-calendar-grid">
                <CalendarWeekdays>
                  {(index) => <CalendarWeekday index={index} className="lab-weekday" />}
                </CalendarWeekdays>
                <CalendarWeeks>
                  {(cell) => <CalendarDay value={cell.date} className="lab-day" />}
                </CalendarWeeks>
              </CalendarGrid>
            </DatePickerContent>
          </DatePicker>
        </div>

        <div className="lab-field" data-agent-target={target === "terminal" || undefined}>
          <Select
            value={terminalFilter}
            onValueChange={(value) => setTerminal((value as TerminalFilter | null) ?? "all")}
            items={terminals}
          >
            <SelectLabel className="lab-label">Terminal</SelectLabel>
            <SelectTrigger className="lab-input lab-select">
              <SelectValue />
              <ChevronDownIcon aria-hidden="true" size={14} />
            </SelectTrigger>
            <SelectContent className="lab-popup lab-options" sideOffset={6} align="start">
              {terminals.map((item) => (
                <SelectItem key={item.value} value={item.value} className="lab-option">
                  {item.label}
                  <SelectItemIndicator className="lab-check">
                    <CheckIcon aria-hidden="true" size={14} />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="lab-grid">
        <section
          className="lab-card lab-board-card"
          data-agent-target={target === "board" || target === "list" || undefined}
        >
          <Tabs
            value={direction}
            onValueChange={(value) => value && setDirection(value)}
          >
            <div className="lab-card-head">
              <TabsList aria-label="Direction" className="lab-tabs">
                <TabsTab value="departures" className="lab-tab">
                  <PlaneTakeoffIcon aria-hidden="true" size={14} />
                  Departures
                </TabsTab>
                <TabsTab value="arrivals" className="lab-tab">
                  <PlaneLandingIcon aria-hidden="true" size={14} />
                  Arrivals
                </TabsTab>
                <TabsIndicator className="lab-tab-indicator" />
              </TabsList>
              <span className="lab-muted lab-small lab-mono">
                {formatDate(day)} · {liveDay ? "live" : "mock"}
              </span>
            </div>
            <TabsPanel value="departures" className="lab-panel">
              <Board
                direction="departures"
                flights={visible("departures")}
                selected={selected}
                onSelect={setSelected}
              />
            </TabsPanel>
            <TabsPanel value="arrivals" className="lab-panel">
              <Board
                direction="arrivals"
                flights={visible("arrivals")}
                selected={selected}
                onSelect={setSelected}
              />
            </TabsPanel>
          </Tabs>
        </section>

        <aside className="lab-side">
          <section
            className="lab-card lab-details"
            aria-label="Flight details"
            data-agent-target={target === "pass" || undefined}
          >
            {selectedFlight ? (
              <div className="lab-details-body" key={selectedFlight.id + day}>
                <div className="lab-details-top">
                  <div>
                    <p className="lab-muted lab-small">{selectedFlight.airline}</p>
                    <h2 className="lab-details-number">{selectedFlight.number}</h2>
                  </div>
                  <StatusBadge status={selectedFlight.status} />
                </div>
                <div className="lab-route">
                  <div>
                    <span className="lab-code">
                      {selectedFlight.direction === "departures" ? HUB.code : selectedFlight.airport.code}
                    </span>
                    <span className="lab-muted lab-small">
                      {selectedFlight.direction === "departures" ? HUB.city : selectedFlight.airport.city}
                    </span>
                  </div>
                  <div className="lab-route-line" aria-hidden="true" />
                  <div className="lab-align-end">
                    <span className="lab-code">
                      {selectedFlight.direction === "departures" ? selectedFlight.airport.code : HUB.code}
                    </span>
                    <span className="lab-muted lab-small">
                      {selectedFlight.direction === "departures" ? selectedFlight.airport.city : HUB.city}
                    </span>
                  </div>
                </div>
                <dl className="lab-facts">
                  <div>
                    <dt>Scheduled</dt>
                    <dd>{selectedFlight.scheduled}</dd>
                  </div>
                  <div>
                    <dt>Estimated</dt>
                    <dd>{selectedFlight.estimated}</dd>
                  </div>
                  <div>
                    <dt>Terminal</dt>
                    <dd>{selectedFlight.terminal}</dd>
                  </div>
                  <div>
                    <dt>Gate</dt>
                    <dd>{selectedFlight.gate}</dd>
                  </div>
                  <div>
                    <dt>Aircraft</dt>
                    <dd>{selectedFlight.aircraft}</dd>
                  </div>
                  <div>
                    <dt>Duration</dt>
                    <dd>{selectedFlight.duration}</dd>
                  </div>
                </dl>
                <BoardingPass
                  flight={selectedFlight}
                  date={day}
                  open={passOpen}
                  onOpenChange={setPassOpen}
                />
              </div>
            ) : (
              <div className="lab-details-empty">
                <PlaneTakeoffIcon aria-hidden="true" size={20} />
                <p>Select a flight</p>
                <p className="lab-muted lab-small">
                  Use ↑ ↓ on the board, or let the agent pick one.
                </p>
              </div>
            )}
          </section>

          <AgentPanel log={log} running={running} allowed={ALLOWED_ACTIONS} />
        </aside>
      </div>
    </div>
  )
}
