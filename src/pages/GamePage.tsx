import { useLocation } from "react-router-dom";

type GameState = {
    gameMode?: "upload" | "random" | "free";
    instrument?: "piano" | "guitar" | "triangle";
};

function GamePage() {
    const location = useLocation();

    const { gameMode, instrument } = (location.state as GameState) ?? {};

    return (
        <div className="game-page">
            <nav>
                {/* Le composant Navbar de la team viendra ici */}
                <p>Navbar</p>
            </nav>

            <section>
                {/* Animation des notes */}
                <p>Zone des notes</p>
            </section>

            <section>
                {/* Le composant clavier de la team viendra ici */}
                <p>Clavier</p>
            </section>

            <div>
                <p>Mode : {gameMode}</p>
                <p>Instrument : {instrument}</p>
            </div>
        </div>
    );
}

export default GamePage;
