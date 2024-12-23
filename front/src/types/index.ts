export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

export type ChessColor = 'white' | 'black';

export enum GameStatus {
  IN_PROGRESS = 'in_progress',
  CHECKMATE = 'checkmate',
  STALEMATE = 'stalemate',
  DRAW = 'draw',
  SURRENDER = 'surrender',
  CHECK = 'check',
}

export interface ChessPiece {
  type: string;
  color: ChessColor;
  symbol: string;
}

export interface PieceMove {
  color: string;
  from: string;
  piece: string;
  to: string;
}

export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

export interface GameHistoryItem {
  game_id: number;
  opponentName: string;
  opponentColor: ChessColor;
  isPublic: boolean;
  result: number | null;
  status: GameStatus;
  createdAt?: string;
  moves?: number;
}

export interface GameHistoryFilters {
  dateRange?: [Date, Date];
  result?: 'won' | 'lost' | 'draw' | null;
  isPublic?: boolean;
  page: number;
  itemsPerPage: number;
}
