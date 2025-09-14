export interface Player {
    id: string;
    name: string;
    team: string;
    score?: number;
    buzzed?: boolean; // Ajoute cette ligne
}

export interface Game {
    id: string;
    hostId: string;
    players: Player[];
    status: 'waiting' | 'in-progress' | 'finished';
}

export interface Score {
    playerId: string;
    points: number;
}