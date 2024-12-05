export interface ChessMove {
    from: string;
    to: string;
    piece: string;
  }

  export interface ChessPiece {
    type: "PAWN" | "ROOK" | "KNIGHT" | "BISHOP" | "QUEEN" | "KING";
    color: "WHITE" | "BLACK";
    hasMoved?: boolean;
  }

  export interface ChessBoard {
    [square: string]: ChessPiece | null;
  }

