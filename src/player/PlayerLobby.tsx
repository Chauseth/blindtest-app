import React, { useEffect, useState } from "react";
import axios from "axios";
import { joinGame, getTeamNames, getPlayers } from '../common/api';
import { Player } from '../common/types';
import Buzzer from './Buzzer';
import theme from '../common/AppTheme.module.css';

const TEAM_COLORS: Record<string, string> = {
    "Team A": "#4F8EF7",
    "Team B": "#F76E4F",
    "": "#888"
};

const PlayerLobby: React.FC = () => {
    const [gameId, setGameId] = useState<string>('');
    const [team, setTeam] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [error, setError] = useState<string>('');
    const [player, setPlayer] = useState<Player | null>(null);
    const [kicked, setKicked] = useState<boolean>(false);
    const [teamNames, setTeamNames] = useState<Record<string, string>>({ "Team A": "Team A", "Team B": "Team B" });

    const handleJoinGame = async () => {
        if (!gameId || !team || !name) {
            setError('Merci de saisir un code partie, un nom et une équipe.');
            return;
        }
        try {
            const player = await joinGame(gameId, { name, team }) as Player;
            setPlayers([...players, player]);
            setPlayer(player);
            setError('');
        } catch (err) {
            setError('Impossible de rejoindre la partie. Vérifie le code.');
        }
    };

    const handleBuzzerPress = () => {
        // Optionnel : feedback visuel/sonore
    };

    useEffect(() => {
        if (!gameId) return;
        const interval = setInterval(async () => {
            try {
                const [playersRes, teamNamesRes] = await Promise.all([
                    getPlayers(gameId),
                    getTeamNames(gameId)
                ]);
                const updatedPlayers = playersRes as Player[];
                setPlayers(updatedPlayers);
                setTeamNames(teamNamesRes);
                if (player && !updatedPlayers.find(p => p.id === player.id)) {
                    setKicked(true);
                    setPlayer(null);
                }
            } catch (e) {}
        }, 50); // <-- réduit de 2000 à 200 ms
        return () => clearInterval(interval);
    }, [gameId, player]);

    const teams = players.reduce<Record<string, Player[]>>((acc, player) => {
        if (!acc[player.team]) acc[player.team] = [];
        acc[player.team].push(player);
        return acc;
    }, {});

    const teamScores = Object.fromEntries(
        Object.entries(teams).map(([team, members]) => [
            team,
            members.reduce((sum, p) => sum + (p.score ?? 0), 0),
        ])
    );

    // Trouve le premier joueur ayant buzzé
    const firstBuzzedPlayerId = players.find(p => p.buzzed)?.id;

    return (
        <div className={theme.root}>
            <div className={theme.centeredContainer}>
                <h1 className={theme.title}>🎵 Blindtest</h1>
                <p className={theme.subtitle}>
                    Rejoins une partie et buzze pour ta team !
                </p>
                {!player && !kicked && (
                    <div className={theme.form}>
                        <input
                            type="text"
                            placeholder="Code partie"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value)}
                            className={theme.input}
                        />
                        <input
                            type="text"
                            placeholder="Ton prénom"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={theme.input}
                        />
                        <select
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            className={theme.select}
                        >
                            <option value="">Choisis ton équipe</option>
                            <option value="Team A">{teamNames["Team A"] ?? "Team A"}</option>
                            <option value="Team B">{teamNames["Team B"] ?? "Team B"}</option>
                        </select>
                        <button
                            onClick={handleJoinGame}
                            className={theme.buttonPrimary}
                        >
                            Rejoindre la partie
                        </button>
                        {error && <div className={theme.error}>{error}</div>}
                    </div>
                )}
                {kicked && (
                    <div className={theme.kicked}>
                        Vous avez été retiré de la partie par l’animateur.
                    </div>
                )}
                {player && !kicked && (
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <h2
                            style={{ color: TEAM_COLORS[player.team] || '#333', marginBottom: 8 }}
                        >
                            {player.name}
                            <span
                                style={{
                                    fontSize: 16,
                                    background: TEAM_COLORS[player.team] || '#eee',
                                    color: '#fff',
                                    borderRadius: 8,
                                    padding: '2px 10px',
                                    marginLeft: 8
                                }}
                            >
                                {teamNames[player.team] ?? player.team}
                            </span>
                        </h2>
                        <Buzzer
                            playerId={player.id}
                            onBuzzerPress={handleBuzzerPress}
                            buzzed={
                                // Le buzzer est désactivé si n'importe qui a buzzé
                                !!players.find(p => p.buzzed)
                            }
                            hasControl={firstBuzzedPlayerId === player.id}
                        />
                    </div>
                )}
                <h2 className={theme.sectionTitle}>Équipes & scores</h2>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Object.entries(teams).map(([team, members]) => (
                        <div
                            key={team}
                            className={`${theme.card} ${team === "Team A" ? theme.teamA : theme.teamB}`}
                        >
                            <div className={`${theme.teamHeader} ${team === "Team A" ? theme.teamAHeader : theme.teamBHeader}`}>
                                {teamNames[team] ?? team}
                                <span className={`${theme.teamScore} ${team === "Team B" ? theme.teamBScore : ""}`}>
                                    {teamScores[team]}
                                </span>
                            </div>
                            <ul className={theme.playerList}>
                                {members.map((p) => (
                                    <li
                                        key={p.id}
                                        className={
                                            theme.playerItem +
                                            (player?.id === p.id ? ' ' + theme.playerItemMe : '')
                                        }
                                    >
                                        {p.name} {player?.id === p.id && <b>(Moi)</b>} — {p.score ?? 0} pts
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlayerLobby;