import React, { useState, useEffect } from "react";
import axios from "axios";
import { Player } from "../common/types";
import { getTeamNames, updateTeamNames } from "../common/api";
import theme from '../common/AppTheme.module.css';
const API_URL = 'http://localhost:4000/api';

const HostDashboard = () => {
  const [gameId, setGameId] = useState<string | null>(() => {
    // Tente de récupérer le gameId du localStorage au chargement
    return localStorage.getItem('hostGameId');
  });
  const [joinGameId, setJoinGameId] = useState<string>(''); // Ajoute cet état
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string>(''); // Pour afficher une erreur éventuelle
  const [customPoints, setCustomPoints] = useState<Record<string, number>>({}); // Ajoute cet état
  const [teamNames, setTeamNames] = useState<Record<string, string>>({ "Team A": "Team A", "Team B": "Team B" });


  // Création de partie
  const handleCreateGame = async () => {
    const game = await axios.post<{ id: string }>(`${API_URL}/games`, {});
    setGameId(game.data.id);
    localStorage.setItem('hostGameId', game.data.id); // Sauvegarde dans le localStorage
  };

  // Permet de "quitter" la partie côté host
  const handleLeaveGame = () => {
    setGameId(null);
    localStorage.removeItem('hostGameId');
    setPlayers([]);
  };

  // Fonction pour rejoindre une partie existante
  const handleJoinExistingGame = async () => {
    if (!joinGameId) {
      setError('Veuillez entrer un Game ID.');
      return;
    }
    try {
      // Vérifie si la partie existe côté backend
      await axios.get(`${API_URL}/games/${joinGameId}/players`);
      setGameId(joinGameId);
      localStorage.setItem('hostGameId', joinGameId);
      setError('');
    } catch (e) {
      setError('Game ID invalide ou partie introuvable.');
    }
  };

  // Charger les noms d'équipes une seule fois au chargement de la partie
  useEffect(() => {
    if (!gameId) return;
    getTeamNames(gameId).then(setTeamNames).catch(() => {});
  }, [gameId]);

  // Polling uniquement pour les joueurs (interval réduit pour plus de réactivité)
  useEffect(() => {
    if (!gameId) return;
    const interval = setInterval(async () => {
      try {
        const playersRes = await axios.get(`${API_URL}/games/${gameId}/players`);
        setPlayers(playersRes.data as Player[]);
      } catch (e) {
        console.error(e);
      }
    }, 300); // 300ms pour plus de réactivité
    return () => clearInterval(interval);
  }, [gameId]);

  const updateScore = async (playerId: string, newScore: number) => {
    await axios.patch(`${API_URL}/players/${playerId}/score`, { score: newScore });
  };

  const resetBuzzers = async () => {
    if (!gameId) return;
    await axios.post(`${API_URL}/games/${gameId}/reset-buzzers`);
  };

  const removePlayer = async (playerId: string) => {
    if (!gameId) return;
    await axios.delete(`${API_URL}/games/${gameId}/players/${playerId}`);
    // Optionnel : tu peux rafraîchir la liste immédiatement si besoin
  };

  const handleCustomPointsChange = (playerId: string, value: string) => {
    const num = parseInt(value, 10);
    setCustomPoints((prev) => ({
      ...prev,
      [playerId]: isNaN(num) ? 1 : num,
    }));
  };

  const handleAddPoints = async (playerId: string, currentScore: number) => {
    const points = customPoints[playerId] ?? 1;
    await updateScore(playerId, currentScore + points);
  };

  const handleRemovePoints = async (playerId: string, currentScore: number) => {
    const points = customPoints[playerId] ?? 1;
    await updateScore(playerId, currentScore - points);
  };

  // Regroupe les joueurs par équipe
  const teams = players.reduce<Record<string, Player[]>>((acc, player) => {
    if (!acc[player.team]) acc[player.team] = [];
    acc[player.team].push(player);
    return acc;
  }, {});

  // Calcule le score total par équipe
  const teamScores = Object.fromEntries(
    Object.entries(teams).map(([team, members]) => [
      team,
      members.reduce((sum, p) => sum + (p.score ?? 0), 0),
    ])
  );

  // Permet de modifier un nom d'équipe
  const handleTeamNameChange = (teamKey: string, value: string) => {
    setTeamNames(prev => ({ ...prev, [teamKey]: value }));
  };

  // Sauvegarde les noms d'équipes personnalisés
  const handleSaveTeamNames = async () => {
    if (!gameId) return;
    await updateTeamNames(gameId, teamNames);
  };

  // Trouve le premier joueur ayant buzzé
  const firstBuzzedPlayerId = players.find(p => p.buzzed)?.id;

  return (
    <div className={theme.root} style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <div
        className={theme.centeredContainer}
        style={{
          maxWidth: 900,
          margin: '2vh auto 0 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 24,
        }}
      >
        <div style={{ flex: '0 0 auto' }}>
          <h1 className={theme.title} style={{ textAlign: 'left', fontSize: 28, marginBottom: 8 }}>👑 Tableau de bord Animateur</h1>
          <p className={theme.subtitle} style={{ textAlign: 'left', color: '#888', marginBottom: 12, fontSize: 15 }}>
            Gère ta partie, les équipes et les scores en direct.
          </p>
          {!gameId ? (
            <>
              <button onClick={handleCreateGame} className={theme.buttonPrimary} style={{ width: '100%', fontSize: 18, padding: '10px 0' }}>
                Créer une nouvelle partie
              </button>
              <div style={{ margin: '12px 0' }}>
                <input
                  type="text"
                  placeholder="Entrer un Game ID"
                  value={joinGameId}
                  onChange={e => setJoinGameId(e.target.value)}
                  className={theme.input}
                  style={{ marginRight: 8, width: 140, fontSize: 15, padding: 8 }}
                />
                <button onClick={handleJoinExistingGame} className={theme.buttonSecondary} style={{ fontSize: 15, padding: '8px 14px' }}>
                  Rejoindre
                </button>
              </div>
              {error && <div className={theme.error}>{error}</div>}
            </>
          ) : (
            <div style={{
              background: '#f4f7fb',
              borderRadius: 8,
              padding: '6px 12px',
              marginBottom: 10,
              fontSize: 16,
              color: '#222',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span><b>Game ID :</b> <span style={{ color: '#F76E4F', fontSize: 20 }}>{gameId}</span></span>
              <button
                onClick={handleLeaveGame}
                className={theme.buttonSecondary}
                style={{
                  marginLeft: 12,
                  fontSize: 14,
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Quitter
              </button>
            </div>
          )}
          {gameId && (
            <div style={{ margin: "8px 0 0 0" }}>
              <h4 style={{ color: '#4F8EF7', marginBottom: 6, fontSize: 16 }}>Noms des équipes :</h4>
              <div style={{ display: 'flex', gap: 12 }}>
                {Object.keys(teamNames).map(teamKey => (
                  <div key={teamKey}>
                    <input
                      type="text"
                      value={teamNames[teamKey]}
                      onChange={e => handleTeamNameChange(teamKey, e.target.value)}
                      className={theme.input}
                      style={{ width: 110, fontSize: 15, marginRight: 4, padding: 6 }}
                    />
                    <span style={{ color: "#888", fontSize: 13 }}>({teamKey})</span>
                  </div>
                ))}
                <button onClick={handleSaveTeamNames} className={theme.buttonPrimary} style={{ fontSize: 14, padding: '6px 12px', height: 38 }}>
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
        <div style={{
          flex: '1 1 auto',
          overflow: 'hidden',
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 className={theme.sectionTitle} style={{ color: '#F76E4F', textAlign: 'left', fontSize: 18, margin: '8px 0 8px 0' }}>
            Équipes :
          </h3>
          <div style={{
            display: 'flex',
            gap: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 0,
          }}>
            {["Team A", "Team B"].map(team => (
              teams[team] ? (
                <div
                  key={team}
                  className={`${theme.card} ${team === "Team A" ? theme.teamA : theme.teamB}`}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '180px',
                    overflow: 'hidden',
                    padding: 8,
                  }}
                >
                  <div className={`${theme.teamHeader} ${team === "Team A" ? theme.teamAHeader : theme.teamBHeader}`} style={{ fontSize: 15, marginBottom: 4 }}>
                    {teamNames[team] ?? team}
                    <span className={`${theme.teamScore} ${team === "Team B" ? theme.teamBScore : ""}`} style={{ fontSize: 13 }}>
                      {teamScores[team]}
                    </span>
                  </div>
                  <ul className={theme.playerList} style={{
                    flex: 1,
                    overflowY: 'auto',
                    margin: 0,
                    padding: 0,
                    fontSize: 13,
                    maxHeight: '110px'
                  }}>
                    {teams[team].map((p) => (
                      <li key={p.id} className={theme.playerItem} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name} <span style={{ color: '#888', fontWeight: 400 }}>({p.score ?? 0} pts)</span>
                          {firstBuzzedPlayerId === p.id && (
                            <span style={{
                              color: "#F76E4F",
                              fontWeight: "bold",
                              marginLeft: 8
                            }}>🚨 Buzz !</span>
                          )}
                        </span>
                        <input
                          type="number"
                          min="1"
                          className={theme.input}
                          style={{ width: 30, margin: "0 2px", fontSize: 12, padding: 2 }}
                          value={customPoints[p.id] ?? 1}
                          onChange={e => handleCustomPointsChange(p.id, e.target.value)}
                          title="Nombre de points"
                        />
                        <button onClick={() => handleAddPoints(p.id, p.score ?? 0)} className={theme.buttonPrimary} style={{ padding: '2px 4px', fontSize: 12, marginLeft: 2, width: 22 }}>+</button>
                        <button onClick={() => handleRemovePoints(p.id, p.score ?? 0)} className={theme.buttonSecondary} style={{ padding: '2px 4px', fontSize: 12, marginLeft: 2, width: 22 }}>-</button>
                        <button onClick={() => removePlayer(p.id)} style={{
                          color: "#F76E4F",
                          background: "none",
                          border: "none",
                          marginLeft: 4,
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: 12
                        }}>✖</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            ))}
          </div>
        </div>
        {gameId && (
          <button
            onClick={resetBuzzers}
            className={theme.buttonSecondary}
            style={{
              width: 180,
              fontSize: 16,
              padding: '10px 0',
              margin: '12px auto 0 auto',
              display: 'block'
            }}
          >
            🔄 Reset Buzzers
          </button>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;