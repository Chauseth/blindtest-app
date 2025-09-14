class ScoreManager {
    private scores: Record<string, number>;
    private buzzers: Set<string>;

    constructor() {
        this.scores = {};
        this.buzzers = new Set();
    }

    addPoints(playerId: string, points: number): void {
        if (!this.scores[playerId]) {
            this.scores[playerId] = 0;
        }
        this.scores[playerId] += points;
    }

    removePoints(playerId: string, points: number): void {
        if (this.scores[playerId]) {
            this.scores[playerId] -= points;
            if (this.scores[playerId] < 0) {
                this.scores[playerId] = 0;
            }
        }
    }

    resetBuzzers(): void {
        this.buzzers.clear();
    }

    getScores(): Record<string, number> {
        return this.scores;
    }

    registerBuzzer(playerId: string): void {
        this.buzzers.add(playerId);
    }

    unregisterBuzzer(playerId: string): void {
        this.buzzers.delete(playerId);
    }

    getBuzzers(): Set<string> {
        return this.buzzers;
    }
}

export default ScoreManager;