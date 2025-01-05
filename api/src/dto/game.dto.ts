import { ChessColor } from "../types";

export interface GameHistoryDTO {
  game_id: number;
  opponentName: string;
  opponentColor: ChessColor;
  isPublic: boolean;
  result: number | null;
  status: string;
  createdAt: Date;
  moves?: number;
}

export interface GameHistoryListDTO {
  games: GameHistoryDTO[];
  total: number;
}

export interface GameHistoryFiltersDTO {
  startDate?: string;
  endDate?: string;
  result?: "won" | "lost" | "draw";
  isPublic?: boolean;
  page?: number;
  itemsPerPage?: number;
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
  playerColor?: ChessColor;
  isPublic: boolean;
}
