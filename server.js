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
  games[id] = { id, players: [], scores: {}, teamNames: { "Team A": "Team A", "Team B": "Team B" } };
  console.log(`[CREATE GAME] Nouvelle partie créée avec id: ${id}`);
  res.json({ id });
});

// Modifier les noms d'équipes
app.patch('/api/games/:gameId/team-names', (req, res) => {
  const { gameId } = req.params;
  const { teamNames } = req.body;
  if (!games[gameId]) {
    console.warn(`[TEAM NAMES] Game not found: ${gameId}`);
    return res.status(404).json({ error: 'Game not found' });
  }
  games[gameId].teamNames = { ...games[gameId].teamNames, ...teamNames };
  console.log(`[TEAM NAMES] Noms d'équipes modifiés pour game ${gameId}:`, teamNames);
  res.json({ success: true, teamNames: games[gameId].teamNames });
});

// Récupérer les noms d'équipes
app.get('/api/games/:gameId/team-names', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) {
    console.warn(`[GET TEAM NAMES] Game not found: ${gameId}`);
    return res.status(404).json({ error: 'Game not found' });
  }
  // console.log(`[GET TEAM NAMES] gameId: ${gameId}`); // Retiré car trop fréquent
  res.json(games[gameId].teamNames);
});

// Obtenir les scores d’une partie
app.get('/api/games/:gameId/scores', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) {
    console.warn(`[GET SCORES] Game not found: ${gameId}`);
    return res.status(404).json({ error: 'Game not found' });
  }
  // console.log(`[GET SCORES] gameId: ${gameId}`); // Retiré car trop fréquent
  res.json(games[gameId].scores);
});

app.get('/api/games/:gameId/players', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) {
    console.warn(`[GET PLAYERS] Game not found: ${gameId}`);
    return res.status(404).json({ error: 'Game not found' });
  }
  const playerList = games[gameId].players.map(pid => ({
    ...players[pid],
    score: games[gameId].scores[pid] ?? 0,
    buzzed: players[pid].buzzed ?? false
  }));
  // console.log(`[GET PLAYERS] gameId: ${gameId}, joueurs: ${playerList.length}`); // Retiré car trop fréquent
  res.json(playerList);
});

// Rejoindre une partie
app.post('/api/games/:gameId/join', (req, res) => {
  const { gameId } = req.params;
  const { name, team } = req.body;
  if (!games[gameId]) {
    console.warn(`[JOIN GAME] Game not found: ${gameId}`);
    return res.status(404).json({ error: 'Game not found' });
  }
  const playerId = uuidv4();
  const player = { id: playerId, name, team, gameId, buzzed: false };
  players[playerId] = player;
  games[gameId].players.push(playerId);
  games[gameId].scores[playerId] = 0;
  console.log(`[JOIN GAME] Player ${name} (${playerId}) rejoint game ${gameId} dans l'équipe ${team}`);
  res.json(player);
});

// Mettre à jour le score d’un joueur
app.patch('/api/players/:playerId/score', (req, res) => {
  const { playerId } = req.params;
  const { score } = req.body;
  const player = players[playerId];
  if (!player) {
    console.warn(`[UPDATE SCORE] Player not found: ${playerId}`);
    return res.status(404).json({ error: 'Player not found' });
  }
  games[player.gameId].scores[playerId] = score;
  console.log(`[UPDATE SCORE] Score mis à jour pour player ${playerId}: ${score}`);
  res.json({ success: true });
});

app.get('/api/games/:gameId/players', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) {
    console.warn(`[GET PLAYERS] Game not found: ${gameId}`);
    return res.status(404).json({ error: 'Game not found' });
  }
  const playerList = games[gameId].players.map(pid => ({
    ...players[pid],
    score: games[gameId].scores[pid] ?? 0,
    buzzed: players[pid].buzzed ?? false
  }));
  // console.log(`[GET PLAYERS] gameId: ${gameId}, joueurs: ${playerList.length}`); // Retiré car trop fréquent
  res.json(playerList);
});

// Nouvelle route pour reset les buzzers
app.post('/api/games/:gameId/reset-buzzers', (req, res) => {
  const { gameId } = req.params;
  if (!games[gameId]) {
    console.warn(`[RESET BUZZERS] Game not found: ${gameId}`);
    return res.status(404).json({ error: 'Game not found' });
  }
  games[gameId].players.forEach(pid => {
    if (players[pid]) players[pid].buzzed = false;
  });
  console.log(`[RESET BUZZERS] Buzzers reset pour game ${gameId}`);
  res.json({ success: true });
});

app.post('/api/players/:playerId/buzz', (req, res) => {
  const { playerId } = req.params;
  if (!players[playerId]) {
    console.error(`[BUZZ] Player not found: ${playerId}`);
    return res.status(404).json({ error: 'Player not found' });
  }
  const gameId = players[playerId].gameId;
  const someoneBuzzed = games[gameId].players.some(pid => players[pid].buzzed);
  if (someoneBuzzed) {
    console.log(`[BUZZ] Buzz refusé: déjà buzzé dans game ${gameId}`);
    return res.status(403).json({ error: 'Buzz already taken' });
  }
  games[gameId].players.forEach(pid => {
    players[pid].buzzed = false;
  });
  players[playerId].buzzed = true;
  console.log(`[BUZZ] Buzz accepté: player ${playerId} dans game ${gameId}`);
  res.json({ success: true });
});

app.delete('/api/games/:gameId/players/:playerId', (req, res) => {
  const { gameId, playerId } = req.params;
  if (!games[gameId]) {
    console.warn(`[REMOVE PLAYER] Game not found: ${gameId}`);
    return res.status(404).json({ error: 'Game not found' });
  }
  if (!players[playerId]) {
    console.warn(`[REMOVE PLAYER] Player not found: ${playerId}`);
    return res.status(404).json({ error: 'Player not found' });
  }
  games[gameId].players = games[gameId].players.filter(pid => pid !== playerId);
  delete games[gameId].scores[playerId];
  delete players[playerId];
  console.log(`[REMOVE PLAYER] Player ${playerId} retiré de game ${gameId}`);
  res.json({ success: true });
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - body:`, req.body);
  next();
});

app.listen(PORT, () => {
  console.log(`Backend blindtest API running on http://localhost:${PORT}/api`);
});