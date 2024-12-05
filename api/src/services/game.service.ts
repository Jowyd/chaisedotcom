import { Game } from "../models/game.model";
import { User } from "../models/user.model";
import { Op } from "sequelize";
import Move from "../models/move.model";
import { GameHistoryDTO } from "../dto/game.dto";
import { ChessMove, ChessPiece } from "../interfaces/chess.interface";
import { GameState } from "../interfaces/game.interface";
import { MoveOptions } from "../interfaces/move.interface";
import { MakeMoveDTO } from "../dto/move.dto";
import { MoveReturnDTO } from "../dto/move.dto";
import { ChessBoard } from "../interfaces/chess.interface";
import moveService from "./move.service";


class GameService {



  async createGame(
    whitePlayerName: string,
    blackPlayerName: string,
    isPublic: boolean = false
  ): Promise<Game> {
    const initialBoard = moveService.getInitialBoard();

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

  async deleteGame(gameId: number): Promise<void> {
    const game = await this.getGameById(gameId);
    await game.destroy();
  }

  async getHistory(userId: number): Promise<GameHistoryDTO[]> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    const games = await Game.findAll({
      where: {
        [Op.or]: [
          { whitePlayerName: user.username },
          { blackPlayerName: user.username },
        ],
      },
      order: [["created_at", "DESC"]],
    });
    return games.map((game) => ({
      gameId: game.id,
      whitePlayerName: game.whitePlayerName,
      blackPlayerName: game.blackPlayerName,
      isPublic: game.isPublic,
      winner: game.winner,
      status: game.status,
    }));
  }

  async getStats(username: string): Promise<number> {
    const user = await Game.findOne({
      where: {
        [Op.or]: [
          { whitePlayerName: username },
          { blackPlayerName: username },
        ],
      },
    });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    const games = await Game.findAll({
      where: {
        [Op.or]: [{winner:username}]
      }
    });
    return games.length;
  }


}

export const gameService = new GameService();
