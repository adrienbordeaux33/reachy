# Projet Reachy

Projet de jeu musical sur navigateur web, développé en équipe de 3 personnes dans le cadre du cours de projet YNOV.

Chaque personne du projet à un rôle spécifique :

- Scrum Master : Diane
- Product Owner : Ivan
- Développeur : Adrien

Rôle du client :

- Laureen

## Simulateur officiel Reachy Mini

Le mode Simulation de l’application contrôle le daemon officiel Reachy Mini. Il nécessite Python et MuJoCo installés selon le guide officiel :

```bash
pip install "reachy-mini[mujoco]"
```

Dans un premier terminal, démarre le simulateur :

```bash
reachy-mini-daemon --sim
```

Dans un second terminal, lance l’application avec `npm run dev`, puis ouvre `http://localhost:5173/robot` et sélectionne **Simulation**. La vue 3D s’affiche dans la fenêtre MuJoCo; les commandes de réaction lui sont envoyées via l’API locale du daemon (`http://127.0.0.1:8000`).

Pour utiliser un daemon sur une autre adresse, définis `VITE_REACHY_SIMULATOR_URL` avant de démarrer Vite.

## Choix de la stack technique

Build et Bundler - Vite

Gestion de l'APP - REACT TS

Navigation - REACT Router

Affichage dynamique du jeu - CANVAS 2D

Store - À définir : Zustand ou Redux

## Suivi de projet

Sur Notion en méthode Agile, avec un tableau Kanban pour suivre l'avancement des tâches et des sprints.
https://app.notion.com/p/Kanban-Reachy-36c9c8f15adb829f940881ba00b2069d

Wireframe sur Excalidraw pour la conception de l'interface utilisateur et des interactions.
https://excalidraw.com/#room=348cd030db6766f07084,_foqs7o-7H4voRRCkta9nQ

Maquette sur Canva pour la visualisation des éléments graphiques et du design global.
https://www.canva.com/design/DAHWlC_7WM8/o8ZlnF1V7x3D3L47P-McWA/edit
