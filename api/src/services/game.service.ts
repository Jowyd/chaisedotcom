import { Game } from "../models/game.model";
import { User } from "../models/user.model";
import { Op } from "sequelize";
import Move from "../models/move.model";

export interface ChessMove {
  from: string;
  to: string;
  piece: string;
}

export interface GameState {
  board: string[][];
  currentPlayer: "white" | "black";
  moveHistory: ChessMove[];
  status: "in_progress" | "checkmate" | "stalemate" | "draw";
}

class GameService {
  async createGame(
    whitePlayerName: string,
    blackPlayerName: string,
    isPublic: boolean = false
  ): Promise<Game> {
    const initialBoard = this.getInitialChessBoard();

    return Game.create({
      whitePlayerName,
      blackPlayerName,
      isPublic,
      status: "in_progress",
      currentState: JSON.stringify(initialBoard),
    });
  }

  async getGameById(gameId: number): Promise<Game> {
    const game = await Game.findByPk(gameId);

    if (!game) {
      throw new Error("Partie non trouvée");
    }

    return game;
  }

  async getMovesByGame(gameId: number): Promise<ChessMove[]> {
    const moves = await Move.findAll({
      where: {
        gameId: gameId,
      },
    });
    const chessMoves: ChessMove[] = moves.map((move) => {
      return {
        from: move.fromSquare,
        to: move.toSquare,
        piece: move.piece,
      };
    });
    return chessMoves;
  }

  async getUserGames(userId: number, limit: number = 50): Promise<Game[]> {
    return Game.findAll({
      where: {
        [Op.or]: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
      },
      order: [["created_at", "DESC"]],
      limit,
    });
  }

  async makeMove(gameId: number, moveData: ChessMove): Promise<Game> {
    const game = await this.getGameById(gameId);
    if (game.status !== "in_progress") {
      throw new Error("La partie est terminée");
    }

    return game.save();
  }

  async deleteGame(gameId: number): Promise<void> {
    const game = await this.getGameById(gameId);
    await game.destroy();
  }

  private getInitialChessBoard(): string[][] {
    return [
      ["R", "N", "B", "Q", "K", "B", "N", "R"],
      ["P", "P", "P", "P", "P", "P", "P", "P"],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      [" ", " ", " ", " ", " ", " ", " ", " "],
      ["p", "p", "p", "p", "p", "p", "p", "p"],
      ["r", "n", "b", "q", "k", "b", "n", "r"],
    ];
  }

  private validateAndApplyMove(
    currentState: GameState,
    move: ChessMove
  ): GameState {
    const newState = { ...currentState };

    if (!this.isMoveValid(newState, move)) {
      throw new Error("Mouvement invalide");
    }

    this.applyMove(newState, move);

    newState.currentPlayer =
      newState.currentPlayer === "white" ? "black" : "white";

    if (this.isCheckmate(newState)) {
      newState.status = "checkmate";
    }

    return newState;
  }

  private isMoveValid(state: GameState, move: ChessMove): boolean {
    return true;
  }

  private applyMove(state: GameState, move: ChessMove): void {}

  private isCheckmate(state: GameState): boolean {
    return false;
  }

  private isGameOver(state: GameState): boolean {
    return ["checkmate", "stalemate", "draw"].includes(state.status);
  }
}

export const gameService = new GameService();
