export interface GameHistoryDTO {
  game_id: number;
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

