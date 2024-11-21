export function validateChessMove(
  fromSquare: string,
  toSquare: string,
  piece: string
): boolean {
  // Implémentation basique de validation de mouvement
  const validPieces = ["PAWN", "ROOK", "KNIGHT", "BISHOP", "QUEEN", "KING"];
  const validSquareRegex = /^[a-h][1-8]$/;

  return (
    validPieces.includes(piece) &&
    validSquareRegex.test(fromSquare) &&
    validSquareRegex.test(toSquare)
  );
}
