# Departures, operable by agents

A small flight board built with [Vercel's UI SDK](https://ui-sdk.dev/docs) (beta). People use it with the keyboard, and an agent drives the same components through `createAgent`, with no mouse simulation. A scripted agent needs no LLM; **Ask the agent** uses a real model through Vercel AI Gateway. A 26-second launch video, made with [Remotion](https://www.remotion.dev) and [snapcn](https://snapcn.dev), is embedded on the page.

The hub is Cluj-Napoca (CLJ). Today's board uses live schedules from [AirLabs](https://airlabs.co) when `AIRLABS_API_KEY` is set; other days, or a missing key, use fictional mock flights.

## What's in it

- A departures/arrivals board you move through with ↑ ↓ Home End and typeahead. The selected flight shows in a details panel.
- Airport search, a date picker and a terminal filter.
- A boarding pass dialog.
- **Let an agent do it**: a scripted agent switches the tab, sets the destination, picks a date, filters the terminal, selects a flight and opens the boarding pass, one `agent.act()` step at a time. The log next to the board shows each call.
- **Ask the agent**: type a question ("next flight to London?"). A model on Vercel AI Gateway answers by calling client-side tools, and each tool call runs in the browser through the same allow-listed `agent.act()` bridge, so it shows up in the step log like the scripted run.
- Black and white in Vercel's style: Geist, thin borders, subtle motion, `prefers-reduced-motion` respected.

## UI SDK APIs used

| Need | Component |
| --- | --- |
| Airport search by city, code or name | `Combobox` with `ComboboxInput`, `ComboboxTrigger`, `ComboboxClear`, `ComboboxContent`, `ComboboxList`, `ComboboxItem` (`keywords`), `ComboboxItemIndicator`, `ComboboxEmpty`, `ComboboxLabel` |
| Date | `DatePicker` with `DatePickerInput`, `DatePickerTrigger`, `DatePickerContent` and the `Calendar*` parts, controlled ISO value, `min` / `max` |
| Terminal filter | `Select` with `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectItemIndicator`, `SelectLabel` |
| Departures / Arrivals | `Tabs` with `TabsList`, `TabsTab`, `TabsPanel`, `TabsIndicator` |
| The board | `Listbox` with `activation="automatic"`, so selection follows the keyboard |
| Boarding pass | `Dialog` with `DialogTrigger`, `DialogBackdrop`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose` |
| Agent bridge | `createAgent` from `@ui-sdk/react/agent`, with an `allow` callback limited to seven label/action pairs, plus `agent.query()` and `agent.act()` |

The agent code is in [`src/demo/agent.ts`](src/demo/agent.ts) and the steps are in `runAgent` in [`src/demo/flight-demo.tsx`](src/demo/flight-demo.tsx).

Two beta gotchas: the bridge matches list items by their rendered text, so the airport code next to each city is `aria-hidden`; and labels have to be unique by whole word, so the tabs are labelled "Direction" rather than "Board", which clashed with "Departures board".

## Live data (AirLabs)

[`src/server/flights.ts`](src/server/flights.ts) fetches `schedules?dep_iata=CLJ` and `arr_iata=CLJ` inside a `"use cache"` function revalidated every 2 hours: about 720 calls a month, under the free tier's 1,000. Codeshare duplicates are dropped. If the key is missing or AirLabs fails, the page falls back to mock flights and retries after 15 minutes. `AIRLABS_FIXTURE=1` uses the bundled fixtures instead of the API.

## Ask the agent (AI SDK + AI Gateway)

- Route: [`src/app/api/agent/route.ts`](src/app/api/agent/route.ts), `streamText` with a plain `"provider/model"` string, which goes through AI Gateway. On Vercel it authenticates with the deployment's OIDC token, so no key is needed; locally run `vercel env pull` or set `AI_GATEWAY_API_KEY`. The model defaults to `openai/gpt-4.1-mini` and can be changed with `AGENT_MODEL`.
- Tools: [`src/agent/tools.ts`](src/agent/tools.ts) declares six tools without `execute`. The browser runs them in `onToolCall` ([`src/demo/ask-agent.tsx`](src/demo/ask-agent.tsx)) through `agent.act()`, and the `createAgent` allow-list refuses anything else. Each result sends the updated board back to the model.
- The system prompt contains the current board (CLJ as the hub, date, filters, visible flights), so the model never invents flights.
- Abuse limits (in memory, per instance): 8 questions and 60 requests per IP every 10 minutes, 1,500 requests per day, 10 tool calls per question, 400-character questions, 40 messages, 400 output tokens. For real traffic, move these to Redis or Vercel Firewall rules.
- Friendly errors: rate limits, a missing OIDC token or key, used-up credits and bad requests each get a plain-language message in the UI. The details only go to the server logs.

### Why AI SDK + Gateway rather than eve

The agent here is one short loop: a model picks UI actions, and the browser runs them. That loop has to live in the client, because the tools *are* the user's on-screen components. AI SDK's client-side tools with `useChat` handle that directly, and Gateway adds model choice, OIDC auth and spend tracking with no extra infrastructure.

eve is built for durable, long-running agents that keep state across sessions, run on schedules, survive restarts, and call server-side tools or other services. It would fit if this demo grew into something like "watch my CLJ→LTN flight and message me when the gate changes", or a back-office agent that reconciles schedules every night. For a stateless "drive the page I'm looking at" demo, it would add moving parts without adding capability.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

Requires Node 20+. `/lab/ui-sdk` redirects to `/`.

## Re-render the video

The Remotion project lives in [`video/`](video/README.md) with its own `package.json`. It's excluded from the Next.js typecheck, lint and build.

```bash
cd video
npm install
npm run render     # writes ../public/launch.mp4 (1920×1080, 30 fps)
npm run poster     # writes ../public/poster.jpg
npm run studio     # preview and edit in Remotion Studio
```

To record new footage after changing the UI, run the app on port 3000 and then `npm run capture` from `video/` (Playwright with a local Chrome; run `npx playwright install ffmpeg` first).

## Stack

Next.js 16 (App Router, React Compiler), React 19, strict TypeScript, `@ui-sdk/core` and `@ui-sdk/react` 0.1.0-beta.9, Tailwind CSS 4 for the base reset, Remotion 4 and snapcn for the video.
