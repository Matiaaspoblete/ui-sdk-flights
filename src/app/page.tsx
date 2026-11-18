import { FlightDemo } from "@/demo/flight-demo"
import { getBoard } from "@/server/flights"
import "./lab.css"

export default async function Home() {
  const board = await getBoard()
  const updated = board.fetchedAt
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Bucharest",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(board.fetchedAt))
    : null

  return (
    <main className="lab">
      <header className="lab-nav">
        <span className="lab-brand">
          <svg aria-hidden="true" viewBox="0 0 76 65" width="16" height="14">
            <path d="M37.5 0 75 65H0z" fill="currentColor" />
          </svg>
          <span className="lab-slash" aria-hidden="true">/</span>
          flights
          <span className="lab-slash" aria-hidden="true">/</span>
          <span className="lab-muted">ui-sdk demo</span>
        </span>
        <a
          className="lab-link"
          href="https://ui-sdk.dev/docs"
          target="_blank"
          rel="noreferrer"
        >
          ui-sdk.dev/docs ↗
        </a>
      </header>

      <FlightDemo board={board} />

      <section className="lab-video" aria-labelledby="lab-video-title">
        <div>
          <h2 id="lab-video-title" className="lab-section-title">
            Launch video
          </h2>
          <p className="lab-muted">
            26 seconds, rendered from React with Remotion and snapcn components.
          </p>
        </div>
        <video
          className="lab-video-player"
          src="/launch.mp4"
          poster="/poster.jpg"
          controls
          muted
          playsInline
          loop
          preload="metadata"
        />
      </section>

      <footer className="lab-footer lab-muted lab-small">
        {board.source === "airlabs" ? (
          <>
            Today&apos;s schedule from{" "}
            <a className="lab-link" href="https://airlabs.co" target="_blank" rel="noreferrer">
              AirLabs
            </a>
            , refreshed every 2 hours (last {updated}). Other days use fictional mock flights.
          </>
        ) : (
          <>Mock schedule for a demo. Airlines and flights are fictional.{board.note ? ` ${board.note}` : ""}</>
        )}
      </footer>
    </main>
  )
}
