"use client"

import { BotIcon, CheckIcon, LoaderIcon, XIcon } from "lucide-react"

export type LogEntry = {
  id: string
  text: string
  call: { ref: string; action: string; args?: unknown[] }
  state: "running" | "done" | "failed"
  error?: string
}

function formatCall(call: LogEntry["call"]): string {
  const args = call.args?.length ? `, args: ${JSON.stringify(call.args)}` : ""
  return `{ ref: "${call.ref}", action: "${call.action}"${args} }`
}

export function AgentPanel({
  log,
  running,
  allowed,
}: {
  log: LogEntry[]
  running: boolean
  allowed: readonly { label: string; action: string }[]
}) {
  return (
    <section className="lab-card lab-agent" aria-label="Agent activity" data-agent-hidden="">
      <div className="lab-card-head">
        <span className="lab-agent-title">
          <BotIcon aria-hidden="true" size={15} />
          agent.act()
        </span>
        <span className="lab-pill" data-live={running || undefined}>
          {running ? "running" : log.length ? "idle" : "ready"}
        </span>
      </div>
      {log.length === 0 ? (
        <div className="lab-agent-empty">
          <p className="lab-muted lab-small">
            Allow-list: the bridge refuses anything else.
          </p>
          <ul className="lab-allow">
            {allowed.map((rule) => (
              <li key={rule.label} className="lab-mono lab-small">
                <span>{rule.action}</span> {rule.label}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ol className="lab-log" aria-live="polite">
          {log.map((entry) => (
            <li key={entry.id} data-state={entry.state}>
              <span className="lab-log-icon" aria-hidden="true">
                {entry.state === "running" ? (
                  <LoaderIcon size={13} />
                ) : entry.state === "done" ? (
                  <CheckIcon size={13} />
                ) : (
                  <XIcon size={13} />
                )}
              </span>
              <div>
                <p>{entry.text}</p>
                <code>{formatCall(entry.call)}</code>
                {entry.error && <p className="lab-error">{entry.error}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
