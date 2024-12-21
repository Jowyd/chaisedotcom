export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
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
