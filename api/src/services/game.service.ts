import { Game, GameStatus } from "../models/game.model";
import { User } from "../models/user.model";
import { Op } from "sequelize";
import Move from "../models/move.model";
import { CreateGameDTO, GameHistoryDTO } from "../dto/game.dto";
import { ChessMove } from "../interfaces/chess.interface";
import { MoveReturnDTO } from "../dto/move.dto";
import moveService from "./move.service";
import { Token } from "../dto/auth.dto";

class GameService {
  async createGame(dto: CreateGameDTO, user: Token): Promise<Game> {
    if (dto.colorAssignment === "fixed" && !dto.playerColor) {
      throw new Error("playerColor is required when colorAssignment is fixed");
    }
    if (
      dto.colorAssignment === "fixed" &&
      dto.playerColor !== "white" &&
      dto.playerColor !== "black"
    ) {
      throw new Error("playerColor must be white or black");
    }
    if (dto.colorAssignment === "random") {
      dto.playerColor = Math.random() < 0.5 ? "white" : "black";
    }
    const whitePlayerName =
      dto.playerColor === "white" ? dto.opponent : user.username;
    const blackPlayerName =
      dto.playerColor === "black" ? dto.opponent : user.username;
    return Game.create({
      user_id: user.id,
      whitePlayerName: whitePlayerName,
      blackPlayerName: blackPlayerName,
      isPublic: dto.isPublic,
    });
  }

  async getGameById(game_id: number): Promise<Game> {
    const game = await Game.findByPk(game_id);

    if (!game) {
      throw new Error("Partie non trouvée");
    }

    return game;
  }

  async getMovesByGame(game_id: number): Promise<ChessMove[]> {
    const moves = await Move.findAll({
      where: {
        game_id: game_id,
      },
    });
    const chessMoves: ChessMove[] = moves.map((move) => {
      return {
        from: move.from,
        to: move.to,
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

  async deleteGame(game_id: number): Promise<void> {
    const game = await this.getGameById(game_id);
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
      game_id: game.id,
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
        [Op.or]: [{ whitePlayerName: username }, { blackPlayerName: username }],
      },
    });
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    const games = await Game.findAll({
      where: {
        [Op.or]: [{ winner: username }],
      },
    });
    return games.length;
  }

  async draw(gameId: number): Promise<MoveReturnDTO> {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    game.status = GameStatus.DRAW;
    await game.save();

    return await moveService.getState(gameId);
  }

  async resign(gameId: number, color: string): Promise<MoveReturnDTO> {
    const game = await Game.findByPk(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    game.status = GameStatus.SURRENDER;
    game.winner = color === "WHITE" ? "BLACK" : "WHITE";
    await game.save();

    return await moveService.getState(gameId);
  }
}

export const gameService = new GameService();
