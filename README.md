# Departures, operable by agents

A small flight board built with [Vercel's UI SDK](https://ui-sdk.dev/docs) (beta). People use it with the keyboard, and an agent drives the same components through `createAgent`, with no mouse simulation and no LLM. A 26-second launch video, made with [Remotion](https://www.remotion.dev) and [snapcn](https://snapcn.dev), is embedded on the page.

All flight data is mock: the airlines are fictional and the hub is Bucharest (OTP).

## What's in it

- A departures/arrivals board you move through with ↑ ↓ Home End and typeahead. The selected flight shows in a details panel.
- Airport search, a date picker and a terminal filter.
- A boarding pass dialog.
- **Let an agent do it**: a scripted agent switches the tab, sets the destination, picks a date, filters the terminal, selects a flight and opens the boarding pass, one `agent.act()` step at a time. The log next to the board shows each call.
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
| Agent bridge | `createAgent` from `@ui-sdk/react/agent`, with an `allow` callback limited to six label/action pairs, plus `agent.query()` and `agent.act()` |

The agent code is in [`src/demo/agent.ts`](src/demo/agent.ts) and the steps are in `runAgent` in [`src/demo/flight-demo.tsx`](src/demo/flight-demo.tsx).

Two beta gotchas: the bridge matches list items by their rendered text, so the airport code next to each city is `aria-hidden`; and labels have to be unique by whole word, so the tabs are labelled "Direction" rather than "Board", which clashed with "Departures board".

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
