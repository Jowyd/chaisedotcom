export interface GameHistoryDTO {
    gameId: number;
    whitePlayerName: string;
    blackPlayerName: string;
    isPublic: boolean;
    winner: string | null;
    status: string;
  }

export interface CreateGameDTO {
    userId: number;
    whitePlayerName: string;
    blackPlayerName: string;
    isPublic: boolean;
}

