import { ChessBoard, ChessPiece } from "../interfaces/chess.interface";

export interface MoveDTO {
    id?: number;
    gameId: number;
    figure: string;
    position: string;
    timestamp: Date;
}

export interface MakeMoveDTO {
    gameId: number;
    from: string;
    to: string;
}

export interface MoveReturnDTO {
    board: ChessBoard;
    turn: string;
    piecesTaken: ChessPiece[];
}

