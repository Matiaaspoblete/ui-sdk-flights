// Captures stills and a screen recording of the demo page for the video.
// Start the app first (npm run build && npm run start), then: npm run capture
import { chromium } from "playwright-core"
import { mkdir, readdir, rename, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const base = process.env.BASE_URL ?? "http://localhost:3000"
const executablePath = process.env.CHROME_PATH ?? "/usr/bin/google-chrome"
const out = path.resolve("public")
const viewport = { width: 1440, height: 900 }

await mkdir(out, { recursive: true })
const browser = await chromium.launch({ executablePath })

const still = await browser.newPage({ viewport, deviceScaleFactor: 1.5 })
await still.goto(`${base}/`, { waitUntil: "networkidle" })
await still.waitForTimeout(800)
await still.screenshot({ path: path.join(out, "board.png") })
await still.keyboard.press("Tab")
await still.locator('[aria-label="Departures board"] [role="option"]').first().focus()
await still.keyboard.press("ArrowDown")
await still.keyboard.press("ArrowDown")
await still.waitForTimeout(500)
await still.screenshot({ path: path.join(out, "keyboard.png") })
await still.close()

const tmp = path.join(out, "tmp-recording")
await rm(tmp, { recursive: true, force: true })
const context = await browser.newContext({
  viewport,
  recordVideo: { dir: tmp, size: viewport },
})
const page = await context.newPage()
const started = Date.now()
await page.goto(`${base}/`, { waitUntil: "networkidle" })
await page.waitForTimeout(1000)
const clickAt = (Date.now() - started) / 1000
await page.getByRole("button", { name: "Let an agent do it" }).click()
await page.getByRole("dialog").waitFor({ state: "visible", timeout: 30000 })
await page.waitForTimeout(2500)
await context.close()
await browser.close()

const [file] = await readdir(tmp)
await rename(path.join(tmp, file), path.join(out, "agent-run.webm"))
await rm(tmp, { recursive: true, force: true })
await writeFile(
  path.join(out, "capture.json"),
  JSON.stringify({ clickAt, capturedAt: new Date().toISOString() }, null, 2)
)
console.log(`Captured to ${out}, click at ${clickAt.toFixed(2)}s`)
