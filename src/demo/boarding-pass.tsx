"use client"

import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog"
import { TicketIcon, XIcon } from "lucide-react"
import { HUB, formatDate, type Flight } from "./flight-data"

function boardingTime(time: string): string {
  const [hours = 0, minutes = 0] = time.split(":").map(Number)
  const total = (hours * 60 + minutes - 35 + 24 * 60) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`
}

function barcode(seed: string): number[] {
  const bars: number[] = []
  let value = 0
  for (const char of seed.repeat(6)) {
    value = (value * 31 + char.charCodeAt(0)) % 997
    bars.push(1 + (value % 3))
  }
  return bars
}

export function BoardingPass({
  flight,
  date,
  open,
  onOpenChange,
}: {
  flight: Flight
  date: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const from = flight.direction === "departures" ? HUB : flight.airport
  const to = flight.direction === "departures" ? flight.airport : HUB

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="lab-button lab-button-secondary lab-wide">
        <TicketIcon aria-hidden="true" size={15} />
        View boarding pass
      </DialogTrigger>
      <DialogBackdrop className="lab-backdrop" />
      <DialogContent className="lab-dialog">
        <div className="lab-pass-head">
          <div>
            <DialogTitle className="lab-dialog-title">Boarding pass</DialogTitle>
            <DialogDescription className="lab-muted">
              {flight.airline} · {flight.number} · {formatDate(date)} · mock
              ticket
            </DialogDescription>
          </div>
          <DialogClose className="lab-icon-button" aria-label="Close">
            <XIcon aria-hidden="true" size={16} />
          </DialogClose>
        </div>

        <div className="lab-pass-route">
          <div>
            <span className="lab-code">{from.code}</span>
            <span className="lab-muted">{from.city}</span>
          </div>
          <div className="lab-pass-line" aria-hidden="true">
            <span />
            <small>{flight.duration}</small>
            <span />
          </div>
          <div className="lab-align-end">
            <span className="lab-code">{to.code}</span>
            <span className="lab-muted">{to.city}</span>
          </div>
        </div>

        <dl className="lab-pass-grid">
          <div>
            <dt>Passenger</dt>
            <dd>POBLETE / MATIAS</dd>
          </div>
          <div>
            <dt>Seat</dt>
            <dd>{flight.seat}</dd>
          </div>
          <div>
            <dt>Group</dt>
            <dd>{flight.group}</dd>
          </div>
          <div>
            <dt>Terminal</dt>
            <dd>{flight.terminal}</dd>
          </div>
          <div>
            <dt>Gate</dt>
            <dd>{flight.gate}</dd>
          </div>
          <div>
            <dt>Boarding</dt>
            <dd>{boardingTime(flight.estimated)}</dd>
          </div>
        </dl>

        <div className="lab-pass-tear" aria-hidden="true" />
        <div className="lab-barcode" aria-hidden="true">
          {barcode(flight.id + date).map((width, index) => (
            <span key={`${flight.id}-${index}`} style={{ width }} />
          ))}
        </div>

        <DialogClose className="lab-button lab-button-primary lab-wide">
          Done
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
