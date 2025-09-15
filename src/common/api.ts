import axios from 'axios';

const API_URL = 'https://blindtest-app.onrender.com/api'; // Replace with your actual API URL

export const createGame = async (gameData: any): Promise<{ id: string }> => {
    const response = await axios.post(`${API_URL}/games`, gameData);
    return response.data as { id: string };
};

export const joinGame = async (gameId: string, playerData: any) => {
    const response = await axios.post(`${API_URL}/games/${gameId}/join`, playerData);
    return response.data;
};

export const updateScore = async (playerId: string, score: number) => {
    const response = await axios.patch(`${API_URL}/players/${playerId}/score`, { score });
    return response.data;
};

export const getTeamNames = async (gameId: string): Promise<Record<string, string>> => {
    const response = await axios.get(`${API_URL}/games/${gameId}/team-names`);
    return response.data as Record<string, string>;
};

export const updateTeamNames = async (gameId: string, teamNames: Record<string, string>) => {
    const response = await axios.patch(`${API_URL}/games/${gameId}/team-names`, { teamNames });
    return response.data;
};

export const getPlayers = async (gameId: string) => {
    const response = await axios.get(`${API_URL}/games/${gameId}/players`);
    return response.data;
};
