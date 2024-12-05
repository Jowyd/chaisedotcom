import { ChessMove } from "./chess.interface";

export interface GameState {
    board: string[][];
    currentPlayer: "white" | "black";
    moveHistory: ChessMove[];
    status: "in_progress" | "checkmate" | "stalemate" | "draw";
  }

  export interface CreateGameRequest {
    whitePlayerName: string;
    blackPlayerName: string;
    isPublic: boolean;
  }