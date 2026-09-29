import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

function Root() {
  const [started, setStarted] = useState(false);

  return (
    <StrictMode>
      {started ? (
        <App />
      ) : (
        <main className="app">
          <button
            type="button"
            className="play-button"
            onClick={() => setStarted(true)}
          >
            JOUER
          </button>
        </main>
      )}
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
