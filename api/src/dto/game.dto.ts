export interface GameHistoryDTO {
  game_id: number;
  whitePlayerName: string;
  blackPlayerName: string;
  isPublic: boolean;
  winner: string | null;
  status: string;
  createdAt: Date;
  moves?: number;
}

export interface GameHistoryFiltersDTO {
  startDate?: string;
  endDate?: string;
  result?: "won" | "lost" | "draw";
  isPublic?: boolean;
}

export interface UpdateGameVisibilityDTO {
  isPublic: boolean;
}

export interface BulkUpdateVisibilityDTO {
  gameIds: number[];
  isPublic: boolean;
}

export interface CreateGameDTO {
  opponent: string;
  colorAssignment: "random" | "fixed";
  playerColor?: "white" | "black";
  isPublic: boolean;
}
