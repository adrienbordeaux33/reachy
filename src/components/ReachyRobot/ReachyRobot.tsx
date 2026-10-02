import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReachyMini,
  type RobotInfo,
  type RobotsChangedEventDetail,
} from "@pollen-robotics/reachy-mini-sdk";
import "./ReachyRobot.css";

export type ReachyRobotAction =
  | "dance-start"
  | "dance-stop"
  | "success"
  | "failure";

export interface ReachyRobotActionEvent {
  id: string;
  action: ReachyRobotAction;
}

interface ReachyRobotProps {
  action?: ReachyRobotActionEvent | null;
  compact?: boolean;
  showTestControls?: boolean;
}

const EMOTION_DATASET = "pollen-robotics/reachy-mini-emotions-library";
const SIMULATOR_BASE_URL = (
  import.meta.env.VITE_REACHY_SIMULATOR_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");
const REACTION_INTERVAL_MS = 1000;
const DANCE_POLL_INTERVAL_MS = 500;

type SimulatorStatus = "disconnected" | "connecting" | "connected" | "error";
type ReactionAction = Extract<ReachyRobotAction, "success" | "failure">;

interface ReactionQueue {
  pending: ReachyRobotActionEvent[];
  timer: ReturnType<typeof setTimeout> | null;
  lastReactionAt: number;
}

interface DanceLoop {
  active: boolean;
  generation: number;
  timer: ReturnType<typeof setTimeout> | null;
  simulatorMoveUuid: string | null;
  requestPending: boolean;
  robotMoveRequested: boolean;
  sawRobotMoveRunning: boolean;
}

const DANCE_MOVE = "dance3";

const ACTION_MOVES: Record<ReactionAction, string> = {
  success: "dance1",
  failure: "no1",
};

const ACTION_LABELS: Record<ReactionAction, string> = {
  success: "Succès (>50 %)",
  failure: "Échec (<50 %)",
};

function isReactionAction(action: ReachyRobotAction): action is ReactionAction {
  return action === "success" || action === "failure";
}

function enqueueReaction(
  queue: ReactionQueue,
  event: ReachyRobotActionEvent,
  dispatch: (event: ReachyRobotActionEvent) => void,
) {
  const isDanceControl =
    event.action === "dance-start" || event.action === "dance-stop";

  if (isDanceControl) {
    if (queue.timer !== null) clearTimeout(queue.timer);
    queue.timer = null;
    if (event.action === "dance-start") queue.pending = [];
    queue.pending.unshift(event);
  } else {
    queue.pending.push(event);
  }
  if (queue.timer !== null) return;

  const dispatchNext = () => {
    const nextEvent = queue.pending.shift();
    if (!nextEvent) {
      queue.timer = null;
      return;
    }

    const isControl =
      nextEvent.action === "dance-start" || nextEvent.action === "dance-stop";
    const delay = isControl
      ? 0
      : Math.max(0, REACTION_INTERVAL_MS - (Date.now() - queue.lastReactionAt));
    queue.timer = setTimeout(() => {
      queue.timer = null;
      if (!isControl) queue.lastReactionAt = Date.now();
      dispatch(nextEvent);
      dispatchNext();
    }, delay);
  };

  dispatchNext();
}

function playRobotMove(robot: ReachyMini, moveName: string): boolean {
  return robot.sendRaw({
    type: "play_recorded_move",
    move_name: moveName,
    dataset_name: EMOTION_DATASET,
    initial_goto_duration: 0.4,
  });
}

export function ReachyRobot({
  action = null,
  compact = false,
  showTestControls = false,
}: ReachyRobotProps) {
  const robotRef = useRef<ReachyMini | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detachVideoRef = useRef<(() => void) | null>(null);
  const lastActionIdRef = useRef<string | null>(null);
  const simulationRef = useRef(false);
  const reactionQueueRef = useRef<ReactionQueue>({
    pending: [],
    timer: null,
    lastReactionAt: 0,
  });
  const danceLoopRef = useRef<DanceLoop>({
    active: false,
    generation: 0,
    timer: null,
    simulatorMoveUuid: null,
    requestPending: false,
    robotMoveRequested: false,
    sawRobotMoveRunning: false,
  });
  const [robots, setRobots] = useState<RobotInfo[]>([]);
  const [status, setStatus] = useState<
    "disconnected" | "connecting" | "connected" | "streaming" | "error"
  >("disconnected");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);
  const [simulatorStatus, setSimulatorStatus] =
    useState<SimulatorStatus>("disconnected");
  const [displayedAction, setDisplayedAction] =
    useState<ReachyRobotActionEvent | null>(null);
  const [testActionId, setTestActionId] = useState(0);

  useEffect(
    () => () => {
      const reactionQueue = reactionQueueRef.current;
      if (reactionQueue.timer !== null) clearTimeout(reactionQueue.timer);
      reactionQueue.pending = [];

      const danceLoop = danceLoopRef.current;
      danceLoop.active = false;
      danceLoop.generation += 1;
      if (danceLoop.timer !== null) clearTimeout(danceLoop.timer);
      if (simulationRef.current && danceLoop.simulatorMoveUuid) {
        void fetch(`${SIMULATOR_BASE_URL}/api/move/stop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid: danceLoop.simulatorMoveUuid }),
        }).catch(() => undefined);
      }

      const robot = robotRef.current;
      detachVideoRef.current?.();
      if (robot) {
        if (robot.state === "streaming") {
          void robot
            .stopSession()
            .catch(() => undefined)
            .finally(() => {
              robot.disconnect();
            });
        } else {
          robot.disconnect();
        }
      }
    },
    [],
  );

  const runSimulatorDanceLoop = useCallback((generation: number) => {
    const loop = danceLoopRef.current;

    const step = async () => {
      if (
        !loop.active ||
        loop.generation !== generation ||
        loop.requestPending
      ) {
        return;
      }

      loop.requestPending = true;
      try {
        if (loop.simulatorMoveUuid === null) {
          const response = await fetch(
            `${SIMULATOR_BASE_URL}/api/move/play/recorded-move-dataset/${EMOTION_DATASET}/${DANCE_MOVE}`,
            { method: "POST" },
          );
          if (!response.ok) {
            throw new Error(`Le simulateur a répondu ${response.status}.`);
          }

          const { uuid } = (await response.json()) as { uuid: string };
          if (!loop.active || loop.generation !== generation) {
            await fetch(`${SIMULATOR_BASE_URL}/api/move/stop`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uuid }),
            });
            return;
          }
          loop.simulatorMoveUuid = uuid;
        } else {
          const response = await fetch(
            `${SIMULATOR_BASE_URL}/api/move/running`,
          );
          if (!response.ok) {
            throw new Error(`Le simulateur a répondu ${response.status}.`);
          }

          const runningMoves = (await response.json()) as { uuid: string }[];
          if (
            !runningMoves.some((move) => move.uuid === loop.simulatorMoveUuid)
          ) {
            loop.simulatorMoveUuid = null;
          }
        }

        if (loop.active && loop.generation === generation) {
          loop.timer = setTimeout(
            () => void step(),
            loop.simulatorMoveUuid === null ? 0 : DANCE_POLL_INTERVAL_MS,
          );
        }
      } catch (error) {
        if (loop.generation === generation) {
          loop.active = false;
          loop.simulatorMoveUuid = null;
          setSimulatorStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "La danse n’a pas pu être envoyée au simulateur.",
          );
        }
      } finally {
        loop.requestPending = false;
      }
    };

    void step();
  }, []);

  const runRobotDanceLoop = useCallback((generation: number) => {
    const loop = danceLoopRef.current;
    const robot = robotRef.current;
    if (!robot || robot.state !== "streaming") return;

    if (!loop.robotMoveRequested) {
      const sent = playRobotMove(robot, DANCE_MOVE);
      if (!sent) {
        loop.active = false;
        setMessage("La danse n’a pas pu être envoyée au robot.");
        return;
      }
      loop.robotMoveRequested = true;
      loop.sawRobotMoveRunning = false;
    }

    const poll = () => {
      if (!loop.active || loop.generation !== generation) return;

      if (robot.state !== "streaming") {
        loop.timer = setTimeout(poll, DANCE_POLL_INTERVAL_MS);
        return;
      }

      if (robot.robotState.is_move_running) {
        loop.sawRobotMoveRunning = true;
      } else if (loop.sawRobotMoveRunning) {
        loop.sawRobotMoveRunning = false;
        loop.robotMoveRequested = playRobotMove(robot, DANCE_MOVE);
        if (!loop.robotMoveRequested) {
          loop.active = false;
          setMessage("La danse n’a pas pu être relancée.");
          return;
        }
        loop.timer = setTimeout(poll, DANCE_POLL_INTERVAL_MS);
        return;
      }

      loop.timer = setTimeout(poll, DANCE_POLL_INTERVAL_MS);
    };

    loop.timer = setTimeout(poll, DANCE_POLL_INTERVAL_MS);
  }, []);

  const startDance = useCallback(() => {
    const loop = danceLoopRef.current;
    if (!loop.active) {
      loop.active = true;
      loop.generation += 1;
      loop.simulatorMoveUuid = null;
      loop.requestPending = false;
      loop.robotMoveRequested = false;
      loop.sawRobotMoveRunning = false;
    }
    if (loop.timer !== null || loop.requestPending) return;

    if (simulationRef.current) {
      if (simulatorStatus === "connected") {
        runSimulatorDanceLoop(loop.generation);
      }
      return;
    }

    runRobotDanceLoop(loop.generation);
  }, [runRobotDanceLoop, runSimulatorDanceLoop, simulatorStatus]);

  const stopDance = useCallback(async () => {
    const loop = danceLoopRef.current;
    loop.active = false;
    loop.generation += 1;
    if (loop.timer !== null) clearTimeout(loop.timer);
    loop.timer = null;
    loop.robotMoveRequested = false;
    loop.sawRobotMoveRunning = false;

    const moveUuid = loop.simulatorMoveUuid;
    loop.simulatorMoveUuid = null;
    loop.requestPending = false;
    if (simulationRef.current && moveUuid) {
      try {
        const response = await fetch(`${SIMULATOR_BASE_URL}/api/move/stop`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid: moveUuid }),
        });
        if (!response.ok && response.status !== 404) {
          setMessage(`L’arrêt de dance3 a répondu ${response.status}.`);
        }
      } catch {
        setMessage("Impossible d’arrêter dance3 dans le simulateur.");
      }
    }
  }, []);

  const connect = async () => {
    setIsBusy(true);
    setStatus("connecting");
    setMessage("Connexion au service Reachy Mini…");

    const robot = new ReachyMini({ appName: "Reachy Rhythm" });
    robotRef.current = robot;
    robot.addEventListener("robotsChanged", (event) => {
      setRobots((event as CustomEvent<RobotsChangedEventDetail>).detail.robots);
    });
    robot.addEventListener("disconnected", () => {
      setStatus("disconnected");
      setMessage("Connexion au robot interrompue.");
    });

    try {
      const authenticated = await robot.authenticate();
      if (!authenticated) {
        setMessage("Authentification Hugging Face requise.");
        setStatus("disconnected");
        await robot.login();
        return;
      }

      await robot.connect();
      setRobots(robot.robots);
      setStatus("connected");
      setMessage("Choisis un Reachy Mini disponible.");
    } catch (error) {
      robot.disconnect();
      robotRef.current = null;
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Connexion impossible. Vérifie que le robot est allumé.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const connectToRobot = async (robotInfo: RobotInfo) => {
    const robot = robotRef.current;
    if (!robot || robotInfo.busy) return;

    setIsBusy(true);
    setMessage(`Connexion à ${robotInfo.meta?.name ?? "Reachy Mini"}…`);
    try {
      if (videoRef.current) {
        detachVideoRef.current = robot.attachVideo(videoRef.current);
      }
      await robot.startSession(robotInfo.id);
      await robot.ensureAwake();
      setStatus("streaming");
      setMessage("Reachy Mini est prêt.");
      if (danceLoopRef.current.active) startDance();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "La session avec le robot a échoué.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const disconnect = async () => {
    await stopDance();
    const robot = robotRef.current;
    robotRef.current = null;
    detachVideoRef.current?.();
    detachVideoRef.current = null;
    setStatus("disconnected");
    setMessage("Robot déconnecté.");
    setRobots([]);

    if (!robot) return;
    try {
      if (robot.state === "streaming") await robot.stopSession();
    } finally {
      robot.disconnect();
    }
  };

  const dispatchReaction = useCallback(
    (event: ReachyRobotActionEvent) => {
      if (event.action === "dance-start") {
        setDisplayedAction(event);
        startDance();
        return;
      }
      if (event.action === "dance-stop") {
        setDisplayedAction(event);
        void stopDance();
        return;
      }
      if (!isReactionAction(event.action)) return;
      const reactionAction = event.action;

      setDisplayedAction(event);
      void stopDance().then(() => {
        if (simulationRef.current) {
          const moveName = encodeURIComponent(ACTION_MOVES[reactionAction]);
          void fetch(
            `${SIMULATOR_BASE_URL}/api/move/play/recorded-move-dataset/${EMOTION_DATASET}/${moveName}`,
            { method: "POST" },
          )
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Le simulateur a répondu ${response.status}.`);
              }
            })
            .catch((error: unknown) => {
              setSimulatorStatus("error");
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Impossible d’envoyer le mouvement au simulateur.",
              );
            });
          return;
        }

        const robot = robotRef.current;
        if (robot?.state !== "streaming") return;

        const sent = playRobotMove(robot, ACTION_MOVES[reactionAction]);
        if (!sent) setMessage("Le mouvement n’a pas pu être envoyé au robot.");
      });
    },
    [startDance, stopDance],
  );

  useEffect(() => {
    const currentAction = action;
    if (!currentAction || currentAction.id === lastActionIdRef.current) return;
    lastActionIdRef.current = currentAction.id;

    enqueueReaction(reactionQueueRef.current, currentAction, dispatchReaction);
  }, [action, dispatchReaction]);

  const runTestAction = (nextAction: ReactionAction) => {
    const id = testActionId + 1;
    setTestActionId(id);
    enqueueReaction(
      reactionQueueRef.current,
      { id: `test-${id}`, action: nextAction },
      dispatchReaction,
    );
  };

  const connectToSimulator = async () => {
    setIsBusy(true);
    setSimulatorStatus("connecting");
    setMessage("Connexion au daemon Reachy Mini local…");

    try {
      const response = await fetch(`${SIMULATOR_BASE_URL}/api/state/full`);
      if (!response.ok) {
        throw new Error(`Le daemon a répondu ${response.status}.`);
      }
      setSimulatorStatus("connected");
      setMessage(
        "Simulateur officiel connecté. La vue 3D est dans sa fenêtre.",
      );
      const danceLoop = danceLoopRef.current;
      if (
        danceLoop.active &&
        danceLoop.timer === null &&
        !danceLoop.requestPending
      ) {
        runSimulatorDanceLoop(danceLoop.generation);
      }
    } catch (error) {
      setSimulatorStatus("error");
      setMessage(
        error instanceof Error && error.name !== "TypeError"
          ? error.message
          : "Daemon introuvable. Lance « reachy-mini-daemon --sim » puis réessaie.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const selectMode = async (nextIsSimulation: boolean) => {
    if (isBusy || nextIsSimulation === isSimulation) return;
    await stopDance();
    const reactionQueue = reactionQueueRef.current;
    if (reactionQueue.timer !== null) clearTimeout(reactionQueue.timer);
    reactionQueue.timer = null;
    reactionQueue.pending = [];

    simulationRef.current = nextIsSimulation;
    setIsSimulation(nextIsSimulation);

    if (nextIsSimulation) {
      if (robotRef.current) {
        setIsBusy(true);
        try {
          await disconnect();
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "La déconnexion du robot a échoué.",
          );
        } finally {
          setIsBusy(false);
        }
      }
      await connectToSimulator();
      return;
    }

    setSimulatorStatus("disconnected");
    setMessage("");
  };

  const statusLabel: Record<typeof status, string> = {
    disconnected: "Hors ligne",
    connecting: "Connexion…",
    connected: "Robot disponible",
    streaming: "En ligne",
    error: "À vérifier",
  };
  const simulatorStatusLabel: Record<SimulatorStatus, string> = {
    disconnected: "Simulateur hors ligne",
    connecting: "Connexion au simulateur…",
    connected: "Simulateur connecté",
    error: "Simulateur à vérifier",
  };
  const currentStatus = isSimulation ? simulatorStatus : status;

  if (compact && isCollapsed) {
    return (
      <button
        className="reachy-robot__collapsed"
        type="button"
        aria-label="Agrandir le panneau Reachy Mini"
        onClick={() => setIsCollapsed(false)}
      >
        <span className="reachy-robot__collapsed-mark" aria-hidden="true">
          R
        </span>
        <span>Reachy Mini</span>
        <span
          className="reachy-robot__collapsed-status"
          data-status={currentStatus}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <section
      className={`reachy-robot${compact ? " reachy-robot--compact" : ""}`}
      data-action={displayedAction?.action ?? "idle"}
      data-mode={isSimulation ? "simulation" : "real"}
      aria-label="Contrôle Reachy Mini"
    >
      <header className="reachy-robot__header">
        <div>
          <p className="reachy-robot__eyebrow">PARTENAIRE DE JEU</p>
          <h2>Reachy Mini</h2>
        </div>
        <span
          className={`reachy-robot__status reachy-robot__status--${isSimulation ? simulatorStatus : status}`}
        >
          <span aria-hidden="true" />
          {isSimulation
            ? simulatorStatusLabel[simulatorStatus]
            : statusLabel[status]}
        </span>
        {compact && (
          <button
            className="reachy-robot__collapse-toggle"
            type="button"
            aria-label="Réduire le panneau Reachy Mini"
            title="Réduire"
            onClick={() => setIsCollapsed(true)}
          >
            <span aria-hidden="true">−</span>
          </button>
        )}
      </header>

      <div className="reachy-robot__mode" aria-label="Mode de contrôle">
        <button
          type="button"
          aria-pressed={!isSimulation}
          disabled={isBusy}
          onClick={() => selectMode(false)}
        >
          Réel
        </button>
        <button
          type="button"
          aria-pressed={isSimulation}
          disabled={isBusy}
          onClick={() => selectMode(true)}
        >
          Simulation
        </button>
      </div>

      <div className="reachy-robot__stage">
        <div
          key={displayedAction?.id ?? "idle"}
          className="reachy-robot__mascot"
          aria-hidden="true"
        >
          <span className="reachy-robot__antenna reachy-robot__antenna--left" />
          <span className="reachy-robot__antenna reachy-robot__antenna--right" />
          <div className="reachy-robot__head">
            <span className="reachy-robot__ear reachy-robot__ear--left" />
            <span className="reachy-robot__ear reachy-robot__ear--right" />
            <div className="reachy-robot__face">
              <span className="reachy-robot__eye" />
              <span className="reachy-robot__eye" />
              <span className="reachy-robot__mouth" />
            </div>
          </div>
          <div className="reachy-robot__neck" />
          <div className="reachy-robot__base" />
        </div>
        <video
          ref={videoRef}
          className={`reachy-robot__video${hasVideo ? " is-visible" : ""}`}
          autoPlay
          muted
          playsInline
          onPlaying={() => setHasVideo(true)}
          onEmptied={() => setHasVideo(false)}
          aria-label="Flux vidéo de Reachy Mini"
        />
      </div>

      <div className="reachy-robot__connection">
        {isSimulation ? (
          <>
            <button
              className="reachy-robot__secondary"
              type="button"
              disabled={isBusy}
              onClick={() => void connectToSimulator()}
            >
              {simulatorStatus === "connected"
                ? "Vérifier le simulateur"
                : "Reconnecter le simulateur"}
            </button>
            <p
              className="reachy-robot__message"
              role="status"
              aria-live="polite"
            >
              Les réactions sont simulées visuellement; aucun robot n’est
              piloté.
            </p>
          </>
        ) : status === "disconnected" || status === "error" ? (
          <button
            className="reachy-robot__primary"
            type="button"
            disabled={isBusy}
            onClick={() => void connect()}
          >
            {isBusy ? "Connexion…" : "Connecter Reachy Mini"}
          </button>
        ) : status === "connected" ? (
          <div
            className="reachy-robot__robot-list"
            aria-label="Robots disponibles"
          >
            {robots.length === 0 ? (
              <p>Aucun robot disponible pour le moment.</p>
            ) : (
              robots.map((robot) => (
                <button
                  key={robot.id}
                  className="reachy-robot__robot-choice"
                  type="button"
                  disabled={isBusy || robot.busy}
                  onClick={() => void connectToRobot(robot)}
                >
                  <span>{robot.meta?.name ?? "Reachy Mini"}</span>
                  <span>{robot.busy ? "Occupé" : "Connecter"}</span>
                </button>
              ))
            )}
          </div>
        ) : status === "streaming" ? (
          <button
            className="reachy-robot__secondary"
            type="button"
            disabled={isBusy}
            onClick={() => void disconnect()}
          >
            Déconnecter
          </button>
        ) : (
          <button className="reachy-robot__primary" type="button" disabled>
            Connexion…
          </button>
        )}
        <p className="reachy-robot__message" role="status" aria-live="polite">
          {message || "Connecte-toi avec Hugging Face pour piloter le robot."}
        </p>
      </div>

      {(showTestControls || isSimulation) && (
        <div className="reachy-robot__tests">
          <p>Tester les réactions</p>
          <div>
            {(Object.keys(ACTION_LABELS) as ReactionAction[]).map(
              (testActionName) => (
                <button
                  key={testActionName}
                  type="button"
                  disabled={
                    isSimulation
                      ? simulatorStatus !== "connected"
                      : status !== "streaming"
                  }
                  onClick={() => runTestAction(testActionName)}
                >
                  {ACTION_LABELS[testActionName]}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}
