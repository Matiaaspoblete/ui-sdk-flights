"use client"

import { createAgent } from "@ui-sdk/react/agent"

type Agent = ReturnType<typeof createAgent>

export const ALLOWED_ACTIONS = [
  { label: "Direction", action: "setValue" },
  { label: "Airport", action: "setValue" },
  { label: "Date", action: "setValue" },
  { label: "Terminal", action: "setValue" },
  { label: "Departures board", action: "setValue" },
  { label: "Arrivals board", action: "setValue" },
  { label: "View boarding pass", action: "press" },
] as const

let agent: Agent | null = null

export function getAgent(): Agent {
  agent ??= createAgent({
    allow: (step) =>
      step.confirm === undefined &&
      ALLOWED_ACTIONS.some(
        (rule) => rule.label === step.label && rule.action === step.action
      ),
  })
  return agent
}
