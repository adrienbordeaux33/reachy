# Projet Reachy

Projet de jeu musical sur navigateur web, développé en équipe de 3 personnes dans le cadre du cours de projet YNOV.

Chaque personne du projet à un rôle spécifique :

- Scrum Master : Diane
- Product Owner : Ivan
- Développeur : Adrien

Rôle du client :

- Laureen

## Simulateur officiel Reachy Mini

Le mode **Simulation** utilise le daemon officiel Reachy Mini et son simulateur MuJoCo. Le daemon lance la fenêtre 3D et expose une API locale que l’application utilise pour envoyer les mouvements. Aucun robot physique n’est nécessaire.

### 1. Installer le simulateur

Installe Python (version compatible avec le paquet officiel Reachy Mini) et Node.js, puis ouvre un terminal à la racine du projet.

Il est recommandé d’installer le daemon dans un environnement virtuel Python. Sous Windows PowerShell :

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install "reachy-mini[mujoco]"
```

Sous macOS ou Linux :

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install "reachy-mini[mujoco]"
```

L’installation peut prendre quelques minutes : elle installe le daemon Reachy Mini et les dépendances MuJoCo. Garde l’environnement virtuel activé dans le terminal utilisé pour lancer le daemon.

### 2. Démarrer le daemon MuJoCo

Dans le terminal où l’environnement virtuel est activé, lance :

```bash
reachy-mini-daemon --sim
```

La fenêtre du simulateur MuJoCo doit s’ouvrir et rester active pendant la session. Le daemon expose son API sur `http://127.0.0.1:8000` par défaut. Laisse ce terminal ouvert.

### 3. Lancer l’application

Dans un second terminal, à la racine du projet, installe les dépendances JavaScript si nécessaire puis démarre Vite :

```bash
npm install
npm run dev
```

Ouvre l’adresse affichée par Vite (généralement `http://localhost:5173`), va sur `/robot`, puis sélectionne **Simulation**. L’état **Simulateur connecté** confirme que l’application a joint le daemon. Les réactions et mouvements du jeu sont alors joués dans la fenêtre MuJoCo.

### Utiliser une autre adresse de daemon

L’application cible `http://127.0.0.1:8000` par défaut. Si le daemon est accessible à une autre adresse, crée un fichier `.env.local` à la racine du projet, par exemple :

```dotenv
VITE_REACHY_SIMULATOR_URL=http://127.0.0.1:8000
```

Remplace l’adresse par celle du daemon, puis redémarre le serveur Vite pour appliquer la configuration. Cette variable est l’URL de base de l’API du daemon, sans chemin `/api`.

### Dépannage

- **« Daemon introuvable »** : vérifie que `reachy-mini-daemon --sim` tourne toujours et que l’adresse configurée est correcte. Dans un navigateur sur la même machine, `http://127.0.0.1:8000/api/state/full` doit répondre lorsque le daemon est lancé.
- **La commande `reachy-mini-daemon` est introuvable** : active l’environnement virtuel dans le terminal courant et vérifie que `pip install "reachy-mini[mujoco]"` s’est terminé sans erreur.
- **La fenêtre MuJoCo ne démarre pas** : vérifie l’installation de Python et des dépendances MuJoCo, puis relance le daemon depuis l’environnement virtuel.
- **L’application n’utilise pas la nouvelle URL** : vérifie `.env.local` et redémarre `npm run dev`.

Pour les prérequis système et les problèmes d’installation propres à la plateforme, consulte la documentation officielle Reachy Mini : https://github.com/pollen-robotics/reachy_mini

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
