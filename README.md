# Blindtest App

Blindtest App est une application web de blind test musical, permettant de jouer entre amis avec un animateur et des joueurs répartis en équipes.

## Fonctionnalités

### Animateur (Host)
- Créer une nouvelle partie avec un code unique.
- Rejoindre une partie existante en tant qu’animateur.
- Visualiser les équipes et les scores en temps réel.
- Modifier les noms d’équipes.
- Ajouter ou retirer des points à chaque joueur.
- Retirer un joueur de la partie.
- Réinitialiser les buzzers pour une nouvelle manche.

### Joueur
- Rejoindre une partie via un code.
- Choisir un nom et une équipe.
- Voir la composition des équipes et les scores.
- Utiliser un buzzer (bouton ou barre espace) pour répondre.
- Le premier à buzzer obtient la main (buzzer vert).
- Les autres joueurs sont verrouillés dès qu’un joueur a buzzé.

## Structure du projet

```
blindtest-app
├── public/
│   ├── buzz.mp3
│   └── index.html
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   ├── common/
│   │   ├── api.ts
│   │   ├── AppTheme.module.css
│   │   └── types.ts
│   ├── host/
│   │   ├── HostDashboard.tsx
│   │   └── ScoreManager.ts
│   └── player/
│       ├── Buzzer.module.css
│       ├── Buzzer.tsx
│       ├── PlayerLobby.module.css
│       └── PlayerLobby.tsx
├── server.js
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

1. Clone le dépôt :
   ```sh
   git clone https://github.com/yourusername/blindtest-app.git
   cd blindtest-app
   ```

2. Installe les dépendances :
   ```sh
   npm install
   ```

## Lancement

### Backend (API Express)
Lance le serveur backend (port 4000 par défaut) :
```sh
node server.js
```

### Frontend (React)
Dans un autre terminal, démarre l’application React :
```sh
npm start
```
L’application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Utilisation

- L’animateur crée une partie et partage le code aux joueurs.
- Les joueurs rejoignent la partie, choisissent leur équipe et leur nom.
- L’animateur gère les scores et réinitialise les buzzers à chaque manche.
- Les joueurs buzzent pour répondre dès qu’ils reconnaissent la musique.

## Remarques techniques

- Le buzzer joue un son (`buzz.mp3`) et se désactive pour tous dès qu’un joueur a buzzé.
- Le backend Express gère la logique de partie, joueurs, scores et buzzers.
- Le frontend React utilise un polling rapide pour une expérience quasi-instantanée.
- Pour jouer la musique, l’animateur doit utiliser un lecteur externe (YouTube, Spotify, etc.) : l’application ne contrôle pas la lecture externe.

## Contribution

Les contributions sont les bienvenues ! Ouvre une issue ou une pull request pour toute suggestion ou amélioration.

## License
This project is licensed under the MIT License. See the LICENSE file for details.