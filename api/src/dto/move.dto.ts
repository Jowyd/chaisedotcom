import { ChessBoard, ChessPiece } from "../interfaces/chess.interface";

export interface MoveDTO {
  id?: number;
  game_id: number;
  figure: string;
  position: string;
  timestamp: Date;
}

export interface MakeMoveDTO {
  from: string;
  to: string;
}

export interface MoveReturnDTO {
  id: string;
  fen: string;
  moves: {
    from: string;
    to: string;
    piece: string;
    color: string;
  }[];
  isCheck: boolean;
  isCheckmate: boolean;
  status: string;
  whitePlayer: {
    username: string;
  };
  blackPlayer: {
    username: string;
  };
}

export interface MoveCreateDTO {
  game_id: number;
  from: string;
  to: string;
  piece: string;
  type: string;
  isCheck?: boolean;
  isCheckmate?: boolean;
  turn: string;
}

export interface SuggestionsDTORequest {
  from: string;
}
