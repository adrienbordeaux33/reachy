import { Link } from "react-router-dom";
import { ReachyRobot } from "../components/ReachyRobot/ReachyRobot";

export default function RobotPage() {
  return (
    <main className="robot-page">
      <header className="robot-page__header">
        <Link to="/" aria-label="Retour à l'accueil">
          Reachy Rhythm
        </Link>
        <span>Connexion et réactions</span>
      </header>
      <section className="robot-page__content">
        <div>
          <p className="robot-page__eyebrow">REACHY MINI</p>
          <h1>Le jeu prend vie.</h1>
          <p className="robot-page__intro">
            Connecte un Reachy Mini via Hugging Face ou lance le simulateur
            officiel MuJoCo en local. Reachy réagit après trois réussites
            consécutives ou cinq notes ratées.
          </p>
        </div>
        <ReachyRobot showTestControls />
      </section>
      <footer className="robot-page__footer">
        <Link to="/">Retour à l’accueil</Link>
      </footer>
    </main>
  );
}
