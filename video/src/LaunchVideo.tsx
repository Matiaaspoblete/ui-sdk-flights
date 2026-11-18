import type { CSSProperties, ReactNode } from "react"
import {
  AbsoluteFill,

  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"
import { AgentSteps } from "@/components/snap-cn/agent-steps"
import { LaptopFrame } from "@/components/snap-cn/laptop-frame"
import { TextReveal } from "@/components/snap-cn/text-reveal"
import { WordCaptions } from "@/components/snap-cn/word-captions"
import { WordmarkCut } from "@/components/snap-cn/wordmark-cut"
import { FONTS, SnapCnUIProvider } from "@/lib/snap-cn-ui"
import capture from "../public/capture.json"

const GEIST = FONTS.Geist ?? "sans-serif"
const THEME = {
  background: "#000000",
  foreground: "#ededed",
  card: "#0a0a0a",
  primary: "#ededed",
  primaryForeground: "#000000",
  border: "#242424",
  mutedForeground: "#a1a1a1",
}

const SCENES = {
  title: { from: 0, duration: 96 },
  laptop: { from: 96, duration: 144 },
  prompt: { from: 240, duration: 120 },
  run: { from: 360, duration: 300 },
  end: { from: 660, duration: 120 },
}

export const LAUNCH_DURATION = SCENES.end.from + SCENES.end.duration

const RUN_RATE = 1.2

function Fade({ children, duration }: { children: ReactNode; duration: number }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [0, 8, duration - 8, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

function Eyebrow({ text, style }: { text: string; style?: CSSProperties }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [4, 18], [0, 1], { extrapolateRight: "clamp" })
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: GEIST,
          fontSize: 26,
          fontWeight: 500,
          color: "#ededed",
          padding: "8px 20px",
          border: "1px solid #333",
          borderRadius: 999,
          background: "#111",
        }}
      >
        {text}
      </span>
    </div>
  )
}

function Grid() {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        backgroundImage:
          "linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)",
        backgroundSize: "96px 96px",
        backgroundPosition: "center",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
      }}
    />
  )
}

function BrowserShot() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enter = spring({ frame, fps, config: { damping: 200 } })
  const zoom = interpolate(frame, [0, SCENES.run.duration], [1, 1.04])
  const trim = Math.max(0, Math.round((capture.clickAt - 0.4) * fps))

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 1280,
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid #2a2a2a",
          background: "#0a0a0a",
          boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
          transform: `translateY(${(1 - enter) * 40}px) scale(${zoom})`,
          opacity: enter,
          marginTop: -150,
        }}
      >
        <div
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 18px",
            borderBottom: "1px solid #1f1f1f",
            background: "#0f0f0f",
          }}
        >
          {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
            <span
              key={color}
              style={{ width: 13, height: 13, borderRadius: 7, background: color, opacity: 0.85 }}
            />
          ))}
          <span
            style={{
              margin: "0 auto",
              padding: "6px 80px",
              borderRadius: 8,
              background: "#171717",
              color: "#a1a1a1",
              fontFamily: GEIST,
              fontSize: 18,
            }}
          >
            ui-sdk-flights
          </span>
        </div>
        <OffthreadVideo
          src={staticFile("agent-run.webm")}
          trimBefore={trim}
          playbackRate={RUN_RATE}
          muted
          style={{ width: 1280, height: 800, display: "block" }}
        />
      </div>
    </AbsoluteFill>
  )
}

function EndCard() {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [48, 64], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  return (
    <AbsoluteFill>
      <WordmarkCut word="ui-sdk." dotFrom="#52a8ff" dotTo="#ededed" mode="dark" fontFamily="Geist" theme={THEME} />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 110,
          opacity,
        }}
      >
        <div
          style={{
            fontFamily: GEIST,
            fontSize: 30,
            color: "#a1a1a1",
            display: "flex",
            gap: 18,
            alignItems: "center",
          }}
        >
          <span style={{ color: "#ededed" }}>ui-sdk-flights</span>
          <span>·</span>
          <span>UI SDK + createAgent</span>
          <span>·</span>
          <span>Remotion + snapcn</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

export function LaunchVideo() {
  return (
    <SnapCnUIProvider mode="dark" theme={THEME}>
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <Sequence from={SCENES.title.from} durationInFrames={SCENES.title.duration}>
          <Fade duration={SCENES.title.duration}>
            <Grid />
            <Eyebrow text="ui-sdk-flights · mock data" style={{ top: 330 }} />
            <TextReveal
              text="Departures, operable by agents."
              fontSize={104}
              fontFamily="Geist"
              mode="dark"
              theme={THEME}
            />
          </Fade>
        </Sequence>

        <Sequence from={SCENES.laptop.from} durationInFrames={SCENES.laptop.duration}>
          <Fade duration={SCENES.laptop.duration}>
            <Grid />
            <LaptopFrame
              screenSrc="/board.png"
              entrance="open"
              mode="dark"
              theme={THEME}
              scale={1.55}
              showNotch={false}
              floatLoop
            />
            <WordCaptions
              words={[
                { text: "Built", startFrame: 18 },
                { text: "with", startFrame: 26 },
                { text: "Vercel's", startFrame: 34 },
                { text: "UI", startFrame: 46 },
                { text: "SDK.", startFrame: 54 },
                { text: "Keyboard-first,", startFrame: 76 },
                { text: "accessible.", startFrame: 96, endFrame: 140 },
              ]}
              preset="clean"
              groupSize={3}
              fontSize={60}
              textColor="#ededed"
              accentColor="#52a8ff"
              mode="dark"
              fontFamily="Geist"
              theme={THEME}
            />
          </Fade>
        </Sequence>

        <Sequence from={SCENES.prompt.from} durationInFrames={SCENES.prompt.duration}>
          <Fade duration={SCENES.prompt.duration}>
            <AgentSteps
              query="Find a Lisbon flight on Friday from Terminal 2"
              steps={[
                { running: "Reading the page with agent.snapshot()…", done: "Found 6 components" },
                { running: "Checking the allow-list…", done: "6 actions allowed" },
                { running: "Planning steps with agent.act()…", done: "6 steps planned" },
                { running: "Running…", done: "Done" },
              ]}
              result="Opening the board"
              queryHold={0.6}
              stepHold={0.42}
              fontFamily="Geist"
              mode="dark"
              theme={THEME}
              glowColor="#1a1a1a"
            />
          </Fade>
        </Sequence>

        <Sequence from={SCENES.run.from} durationInFrames={SCENES.run.duration}>
          <Fade duration={SCENES.run.duration}>
            <Grid />
            <BrowserShot />
            <WordCaptions
              words={[
                { text: "An", startFrame: 10 },
                { text: "agent", startFrame: 16 },
                { text: "drives", startFrame: 24 },
                { text: "the", startFrame: 32 },
                { text: "real", startFrame: 38 },
                { text: "components.", startFrame: 46 },
                { text: "Destination,", startFrame: 90 },
                { text: "date,", startFrame: 120 },
                { text: "terminal,", startFrame: 150 },
                { text: "flight.", startFrame: 185 },
                { text: "No", startFrame: 225 },
                { text: "mouse", startFrame: 233 },
                { text: "simulation.", startFrame: 241, endFrame: 295 },
              ]}
              preset="clean"
              groupSize={3}
              fontSize={60}
              textColor="#ededed"
              accentColor="#52a8ff"
              mode="dark"
              fontFamily="Geist"
              theme={THEME}
            />
          </Fade>
        </Sequence>

        <Sequence from={SCENES.end.from} durationInFrames={SCENES.end.duration}>
          <EndCard />
        </Sequence>
      </AbsoluteFill>
    </SnapCnUIProvider>
  )
}

