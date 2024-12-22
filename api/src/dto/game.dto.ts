export interface GameHistoryDTO {
  game_id: number;
  whitePlayerName: string;
  blackPlayerName: string;
  isPublic: boolean;
  winner: string | null;
  status: string;
}

export interface CreateGameDTO {
  opponent: string;
  colorAssignment: "random" | "fixed";
  playerColor?: "white" | "black";
  isPublic: boolean;
}
