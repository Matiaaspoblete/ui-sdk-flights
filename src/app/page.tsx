import { FlightDemo } from "@/demo/flight-demo"
import "./lab.css"

export default function Home() {
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

      <FlightDemo />

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
        Mock schedule for a demo. Airlines and flights are fictional.
      </footer>
    </main>
  )
}
