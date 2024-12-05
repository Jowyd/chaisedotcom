export interface MoveOptions {
    isPromotion?: boolean;
    promotionPiece?: "QUEEN" | "ROOK" | "KNIGHT" | "BISHOP";
    isCastle?: "KINGSIDE" | "QUEENSIDE" | null;
    isEnPassant?: boolean;
  }