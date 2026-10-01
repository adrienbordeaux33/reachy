import { Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import FreeGamePage from "./pages/FreeGamePage";

import "./App.css";


function App() {
    return (
        <main className="app">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/game" element={<GamePage />} />
                <Route path="/free-game" element={<FreeGamePage />} />
            </Routes>
        <SongPianoHero />
        </main>
    );
}

export default App;
