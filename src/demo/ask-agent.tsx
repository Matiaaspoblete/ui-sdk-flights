"use client"

import { useChat } from "@ai-sdk/react"
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  type UIMessage,
} from "ai"
import { ArrowUpIcon, LoaderIcon, SquareIcon } from "lucide-react"
import { useRef, useState } from "react"
import type { AgentToolName, BoardContext } from "@/agent/tools"

export type AgentStep = { ref: string; action: string; args?: unknown[] }
export type StepTarget = "board" | "airport" | "date" | "terminal" | "list" | "pass"
export type ActResult = { ok: boolean; error?: string }

const MAX_TOOL_CALLS = 10

const EXAMPLES = [
  "When is the next flight to London?",
  "Show tomorrow's arrivals",
  "Open a boarding pass for a Lisbon flight in two days",
]

function friendly(error: Error | undefined): string | null {
  if (!error) return null
  try {
    const parsed = JSON.parse(error.message) as { error?: string }
    if (parsed.error) return parsed.error
  } catch {}
  return error.message || "The agent hit an error. Try again."
}

export function AskAgent({
  getBoard,
  act,
  onStart,
}: {
  getBoard: () => BoardContext
  act: (text: string, target: StepTarget, step: AgentStep) => Promise<ActResult>
  onStart: () => void
}) {
  const [input, setInput] = useState("")
  const toolCalls = useRef(0)

  function plan(name: AgentToolName, input: Record<string, unknown>, board: BoardContext) {
    switch (name) {
      case "set_direction":
        return { text: `Switch to ${String(input.direction)}`, target: "board" as const, step: { ref: "Direction", action: "setValue", args: [input.direction] } }
      case "set_airport":
        return { text: `Set airport to ${String(input.city)}`, target: "airport" as const, step: { ref: "Airport", action: "setValue", args: [input.city] } }
      case "set_date":
        return { text: `Pick ${String(input.date)}`, target: "date" as const, step: { ref: "Date", action: "setValue", args: [input.date] } }
      case "set_terminal":
        return { text: `Filter to ${String(input.terminal)}`, target: "terminal" as const, step: { ref: "Terminal", action: "setValue", args: [input.terminal] } }
      case "select_flight": {
        const board_ = board.direction === "departures" ? "Departures board" : "Arrivals board"
        return { text: `Open flight ${String(input.flightId)}`, target: "list" as const, step: { ref: board_, action: "setValue", args: [input.flightId] } }
      }
      case "open_boarding_pass":
        return { text: "Open the boarding pass", target: "pass" as const, step: { ref: "View boarding pass", action: "press" } }
    }
  }

  const { messages, sendMessage, addToolOutput, status, error, stop, clearError } = useChat<UIMessage>({
    id: "flight-board-agent",
    transport: new DefaultChatTransport({
      api: "/api/agent",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: { messages: messages.slice(-40), board: getBoard() },
      }),
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) return
      const name = toolCall.toolName as AgentToolName
      toolCalls.current++
      if (toolCalls.current > MAX_TOOL_CALLS) {
        addToolOutput({
          tool: name,
          toolCallId: toolCall.toolCallId,
          state: "output-error",
          errorText: "Step budget for this question is used up. Answer with what you have.",
        })
        return
      }
      const step = plan(name, (toolCall.input ?? {}) as Record<string, unknown>, getBoard())
      const result = step
        ? await act(step.text, step.target, step.step)
        : { ok: false, error: `Unknown tool ${name}` }
      // Let React commit the new filters before reading the board back.
      await new Promise((resolve) => setTimeout(resolve, 150))
      addToolOutput({
        tool: name,
        toolCallId: toolCall.toolCallId,
        output: { ok: result.ok, error: result.error, board: getBoard() },
      })
    },
  })

  const busy = status === "submitted" || status === "streaming"
  const lastUser = messages.findLastIndex((message) => message.role === "user")
  const lastAnswer = messages
    .slice(lastUser + 1)
    .reverse()
    .find((message) => message.role === "assistant" && message.parts.some((part) => part.type === "text" && part.text.trim()))
  const answer = lastAnswer?.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim()
  const errorText = friendly(error)

  function ask(text: string) {
    const question = text.trim()
    if (!question || busy) return
    clearError()
    toolCalls.current = 0
    onStart()
    setInput("")
    void sendMessage({ text: question })
  }

  return (
    <section className="lab-ask" aria-label="Ask the agent" data-agent-hidden="">
      <form
        className="lab-ask-form"
        onSubmit={(event) => {
          event.preventDefault()
          ask(input)
        }}
      >
        <input
          className="lab-input lab-ask-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask the agent: “next flight to London from CLJ”"
          maxLength={400}
          aria-label="Ask the agent"
        />
        {busy ? (
          <button type="button" className="lab-button lab-button-secondary" onClick={() => void stop()}>
            <SquareIcon aria-hidden="true" size={13} /> Stop
          </button>
        ) : (
          <button type="submit" className="lab-button lab-button-primary" disabled={!input.trim()}>
            <ArrowUpIcon aria-hidden="true" size={14} /> Ask
          </button>
        )}
      </form>
      <div className="lab-ask-out" aria-live="polite">
        {errorText ? (
          <p className="lab-error">{errorText}</p>
        ) : busy && !answer ? (
          <p className="lab-muted lab-small">
            <LoaderIcon aria-hidden="true" size={12} className="lab-spin" /> Thinking…
          </p>
        ) : answer ? (
          <p className="lab-ask-answer">{answer}</p>
        ) : (
          <p className="lab-muted lab-small">
            Real model via Vercel AI Gateway. It can only use the allow-listed controls.{" "}
            {EXAMPLES.map((example) => (
              <button key={example} type="button" className="lab-chip" onClick={() => ask(example)}>
                {example}
              </button>
            ))}
          </p>
        )}
      </div>
    </section>
  )
}
