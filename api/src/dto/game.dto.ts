export interface GameHistoryDTO {
    gameId: number;
    whitePlayerName: string;
    blackPlayerName: string;
    isPublic: boolean;
    winner: string | null;
    status: string;
  }