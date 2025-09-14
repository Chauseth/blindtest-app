const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

let games = {};
let players = {};

function generateGameCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Créer une partie
app.post('/api/games', (req, res) => {
  const id = generateGameCode();
  // Ajoute teamNames par défaut
  games[id] = { id, players: [], scores: {}, teamNames: { "Team A": "Team A", "Team B": "Team B" } };
  res.json({ id });
});

// Modifier les noms d'équipes
app.patch('/api/games/:gameId/team-names', (req, res) => {
  const { gameId } = req.params;
  const { teamNames } = req.body;
  if (!games[gameId]) return res.status(404).json({ error: 'Game not found' });
  games[gameId].teamNames = { ...games[gameId].teamNames, ...teamNames };
  res.json({ success: true, teamNames: games[gameId].teamNames });
});

// Récupérer les noms d'équipes
app.get('/api/games/:gameId/team-names', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) return res.status(404).json({ error: 'Game not found' });
  res.json(games[gameId].teamNames);
});

// Rejoindre une partie
app.post('/api/games/:gameId/join', (req, res) => {
  const { gameId } = req.params;
  const { name, team } = req.body;
  if (!games[gameId]) return res.status(404).json({ error: 'Game not found' });
  const playerId = uuidv4();
  // Ajoute cette propriété lors de la création du joueur
  const player = { id: playerId, name, team, gameId, buzzed: false };
  players[playerId] = player;
  games[gameId].players.push(playerId);
  games[gameId].scores[playerId] = 0;
  res.json(player);
});

// Mettre à jour le score d’un joueur
app.patch('/api/players/:playerId/score', (req, res) => {
  const { playerId } = req.params;
  const { score } = req.body;
  const player = players[playerId];
  if (!player) return res.status(404).json({ error: 'Player not found' });
  games[player.gameId].scores[playerId] = score;
  res.json({ success: true });
});

// Obtenir les scores d’une partie
app.get('/api/games/:gameId/scores', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) return res.status(404).json({ error: 'Game not found' });
  res.json(games[gameId].scores);
});

app.get('/api/games/:gameId/players', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) return res.status(404).json({ error: 'Game not found' });
  const playerList = games[gameId].players.map(pid => ({
    ...players[pid],
    score: games[gameId].scores[pid] ?? 0,
    buzzed: players[pid].buzzed ?? false
  }));
  res.json(playerList);
});

// Nouvelle route pour reset les buzzers
app.post('/api/games/:gameId/reset-buzzers', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) return res.status(404).json({ error: 'Game not found' });
  games[gameId].players.forEach(pid => {
    if (players[pid]) players[pid].buzzed = false;
  });
  res.json({ success: true });
});

app.post('/api/players/:playerId/buzz', (req, res) => {
  const { playerId } = req.params;
  if (!players[playerId]) return res.status(404).json({ error: 'Player not found' });
  const gameId = players[playerId].gameId;
  // Si déjà quelqu'un a buzzé, refuse le buzz
  const someoneBuzzed = games[gameId].players.some(pid => players[pid].buzzed);
  if (someoneBuzzed) {
    return res.status(403).json({ error: 'Buzz already taken' });
  }
  // Seul le joueur qui buzz a buzzed: true, les autres false
  games[gameId].players.forEach(pid => {
    players[pid].buzzed = false;
  });
  players[playerId].buzzed = true;
  res.json({ success: true });
});

app.delete('/api/games/:gameId/players/:playerId', (req, res) => {
  const { gameId, playerId } = req.params;
  if (!games[gameId]) return res.status(404).json({ error: 'Game not found' });
  if (!players[playerId]) return res.status(404).json({ error: 'Player not found' });

  // Retirer le joueur de la liste de la partie
  games[gameId].players = games[gameId].players.filter(pid => pid !== playerId);
  delete games[gameId].scores[playerId];
  delete players[playerId];

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend blindtest API running on http://localhost:${PORT}/api`);
});