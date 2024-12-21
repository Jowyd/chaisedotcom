export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

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
  color: 'white' | 'black';
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
