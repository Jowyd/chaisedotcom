// Créez ce fichier pour les types partagés
export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

export interface ChessPiece {
  type: string;
  color: 'white' | 'black';
  symbol: string;
} 