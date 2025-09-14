# Blindtest App

## Description
Blindtest App is a fun and interactive game designed for friends to enjoy music quizzes in a competitive format. The application allows users to participate as either a host or a player, facilitating an engaging experience for all participants.

## Features

### Host Features
- Create a new game session.
- View and manage player scores.
- Add or remove points from players.
- Reset buzzers for all players.

### Player Features
- Join an existing game session.
- Select a team to compete with.
- Use a buzzer to answer questions.

## Project Structure
```
blindtest-app
├── src
│   ├── host
│   │   ├── HostDashboard.tsx
│   │   └── ScoreManager.ts
│   ├── player
│   │   ├── PlayerLobby.tsx
│   │   └── Buzzer.tsx
│   ├── common
│   │   ├── api.ts
│   │   └── types.ts
│   └── App.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/blindtest-app.git
   ```
2. Navigate to the project directory:
   ```
   cd blindtest-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
- Start the application:
  ```
  npm start
  ```
- Access the host dashboard to create a game or join as a player to participate in an ongoing game.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for details.