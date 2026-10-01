import sceneBackground from "../../assets/fond_reachy.png";
import PianoCanvas from "../canvas/PianoCanvas.tsx";

export default function SongPianoHero() {
    return (
        <main
            className="
        relative
        min-h-screen
        overflow-hidden
        bg-cover
        bg-center
        bg-no-repeat
      "
            style={{
                backgroundImage: `url(${sceneBackground})`,
            }}
        >
            <div
                className="
          relative
          z-10
          mx-auto
          flex
          min-h-screen
          w-full
          max-w-[1400px]
          flex-col
          px-6
          py-6
        "
            >
                {/* Future UI */}
                <header className="flex min-h-20 items-center justify-between">
                    <div>
                        {/* score */}
                    </div>

                    <div>
                        {/* combo / progression */}
                    </div>
                </header>

                {/* Zone de jeu */}
                <div
                    className="
            mx-auto
            aspect-video
            w-full
            max-w-[1000px]
            overflow-hidden
          "
                >
                    <PianoCanvas />
                </div>
            </div>
        </main>
    );
}