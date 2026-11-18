import { Composition } from "remotion"
import "./index.css"
import { LAUNCH_DURATION, LaunchVideo } from "./LaunchVideo"

export function Root() {
  return (
    <Composition
      id="LaunchVideo"
      component={LaunchVideo}
      durationInFrames={LAUNCH_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  )
}
