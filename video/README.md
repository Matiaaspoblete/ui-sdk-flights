# Launch video

The launch video for the demo page, made with [Remotion](https://www.remotion.dev) and [snapcn](https://snapcn.dev) components. It has its own `package.json` and is excluded from the Next.js build, typecheck and lint.

- `src/LaunchVideo.tsx`: the composition (1920×1080, 30 fps, 26 s).
- `src/components/snap-cn/`, `src/lib/snap-cn-ui/`: snapcn components, added with `npx shadcn@latest add @snapcn/text-reveal @snapcn/laptop-frame @snapcn/agent-steps @snapcn/word-captions @snapcn/wordmark-cut`.
- `public/`: footage captured from the demo (`board.png`, `agent-run.webm`, `capture.json`).

## Re-render

```bash
cd video
npm install
npm run render   # writes ../public/launch.mp4
npm run poster   # writes ../public/poster.jpg
npm run studio   # preview and edit in Remotion Studio
```

## Recapture the footage

After changing the demo UI, record it again. Start the app from the repo root, then capture from here:

```bash
npm run build && npm run start          # repo root, port 3000
cd video && npx playwright install ffmpeg
npm run capture                         # BASE_URL and CHROME_PATH are optional
```

The capture script uses Playwright with a local Chrome (`/usr/bin/google-chrome` by default).
