import { Game } from "../models/game.model";
import { User } from "../models/user.model";
import { Op } from "sequelize";
import Move from "../models/move.model";
import {
  CreateGameDTO,
  GameHistoryDTO,
  GameHistoryFiltersDTO,
} from "../dto/game.dto";
import { ChessMove } from "../interfaces/chess.interface";
import { GameReturnDTO, PlayersGameInformations } from "../dto/move.dto";
import moveService from "./move.service";
import { UserToken } from "../dto/auth.dto";
import { ChessColor } from "../types";
import { notFound } from "../error/NotFoundError";
import { GameStatus } from "../enums/gameStatus.enum";
import { BaseError, GameNotFoundError, InvalidBulkOperationError, InvalidColorAssignmentError, InvalidGameConfigError, InvalidGameStateError, InvalidHistoryFiltersError, InvalidPlayerColorError, InvalidResignationError, UnauthorizedGameAccessError } from "../error/custom-error";

class GameService {
  WINNER_POINTS = 5;
  DRAW_POINTS = 0;
  LOSER_POINTS = -3;
  
  async createGame(dto: CreateGameDTO, user: UserToken): Promise<Game> {
    if (dto.colorAssignment === "fixed" && !dto.playerColor) {
      throw new InvalidColorAssignmentError();
    }
    if (
      dto.colorAssignment === "fixed" &&
      dto.playerColor !== "WHITE" &&
      dto.playerColor !== "BLACK"
    ) {
      throw new InvalidPlayerColorError();
    }
    try {
      if (dto.colorAssignment === "random") {
        dto.playerColor = Math.random() < 0.5 ? "WHITE" : "BLACK";
      }
      return await Game.create({
        user_id: user.id,
        opponentName: dto.opponent,
        opponentColor: dto.playerColor,
        isPublic: dto.isPublic,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new InvalidGameConfigError('Failed to create game: ' + error.message);
      }
      throw new InvalidGameConfigError('Failed to create game: Unknown error');
    }
  }

  async getGameById(game_id: number): Promise<Game> {
    const game = await Game.findByPk(game_id);

    if (!game) {
      throw new GameNotFoundError(game_id);
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

  async getHistory(
    userId: number,
    filters?: GameHistoryFiltersDTO
  ): Promise<GameHistoryDTO[]> {
    try{
    const whereClause: any = {
      user_id: userId,
    };
    const page = filters?.page || 0;
    const itemsPerPage = filters?.itemsPerPage || 50;

    if (filters) {
      if (filters.startDate && filters.endDate) {
        if (new Date(filters.startDate) > new Date(filters.endDate)) {
          throw new InvalidHistoryFiltersError('Start date must be before end date');
        }
        whereClause.created_at = {
          [Op.between]: [
            new Date(filters.startDate),
            new Date(filters.endDate),
          ],
        };
      }

      if (filters.result) {
        switch (filters.result) {
          case "won":
            whereClause.status = GameStatus.WON;
            break;
          case "lost":
            whereClause.status = GameStatus.LOST;
            break;
          case "draw":
            whereClause.status = GameStatus.DRAW;
            break;
        }
      }

      if (filters.isPublic !== undefined) {
        whereClause.isPublic = filters.isPublic;
      }
      
    }

    const games = await Game.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      include: [{ model: Move, as: "moves" }],
      limit: itemsPerPage,
      offset: page,
    });

    return games.map((game) => ({
      game_id: game.id,
      opponentName: game.opponentName,
      opponentColor: game.opponentColor,
      isPublic: game.isPublic,
      result: game.result,
      status: game.status,
      createdAt: game.created_at,
      moves: game.moves?.length || 0,
    }));
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }
    throw new InvalidHistoryFiltersError(error instanceof Error ? error.message : 'Unknown error');
  }
  }

  async getPublicHistory(
    username: string,
    filters?: GameHistoryFiltersDTO
  ): Promise<GameHistoryDTO[]> {
    const whereClause: any = {
      isPublic: true,
      [Op.or]: [{ whitePlayerName: username }, { blackPlayerName: username }],
    };

    if (filters) {
      if (filters.startDate && filters.endDate) {
        whereClause.createdAt = {
          [Op.between]: [
            new Date(filters.startDate),
            new Date(filters.endDate),
          ],
        };
      }

      if (filters.result) {
        switch (filters.result) {
          case "won":
            whereClause.winner = username;
            break;
          case "lost":
            whereClause.winner = {
              [Op.and]: [{ [Op.ne]: username }, { [Op.ne]: null }],
            };
            break;
          case "draw":
            whereClause.status = GameStatus.DRAW;
            break;
        }
      }

      if (filters.isPublic !== undefined) {
        whereClause.isPublic = filters.isPublic;
      }
    }

    const games = await Game.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return games.map((game) => ({
      game_id: game.id,
      opponentName: game.opponentName,
      opponentColor: game.opponentColor,
      isPublic: game.isPublic,
      result: game.result,
      status: game.status,
      createdAt: game.created_at,
      moves: game.moves?.length || 0,
    }));
  }

  async updateGameVisibility(
    gameId: number,
    isPublic: boolean,
    userId: number
  ): Promise<void> {
    const game = await Game.findByPk(gameId);

    if (!game) {
      throw new GameNotFoundError(gameId);
    }

    if (game.user_id !== userId) {
      throw new UnauthorizedGameAccessError();
    }

    await game.update({ isPublic });
  }

  async updateBulkVisibility(
    gameIds: number[],
    isPublic: boolean,
    userId: number
  ): Promise<void> {
    if (!gameIds?.length) {
      throw new InvalidBulkOperationError('No game IDs provided');
    }
  
    try {
      await Game.update(
        { isPublic },
        {
          where: {
            id: { [Op.in]: gameIds },
            user_id: userId,
          },
        }
      );
    } catch (error) {
      throw new InvalidBulkOperationError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async getStats(username: string, user: UserToken): Promise<number> {
    const userDb = await User.findOne({
      where: {
        username,
      },
    });
    if (!userDb) {
      return notFound("User: " + username);
    }
    return 0;
  }

  async getGameUserMoves(
    gameId: number,
    user_id?: number,
    moveIndex?: number
  ): Promise<Game> {
    const game = await Game.findOne({
      where: {
        id: gameId,
      },
      include: [
        {
          model: Move,
          as: "moves",
          order: [["id", "ASC"]],
          limit: moveIndex && moveIndex == 0 ? 1 : moveIndex,
        },
        { model: User, as: "user" },
      ],
    });
    if (!game) {
      throw new GameNotFoundError(gameId);
    }
  
    if (user_id && game.user_id !== user_id) {
      throw new UnauthorizedGameAccessError();
    }

    if (moveIndex === 0) {
      game.moves = [];
    }
    return game;
  }

  async draw(gameId: number, user: UserToken): Promise<GameReturnDTO> {
    let game = await this.getGameUserMoves(gameId, user.id);

    game.status = GameStatus.DRAW;
    await game.save();

    return await moveService.getState(gameId, user);
  }

  async resign(
    gameId: number,
    color: ChessColor,
    user: UserToken
  ): Promise<GameReturnDTO> {
      let game = await this.getGameUserMoves(gameId, user.id);

      if (game.status === GameStatus.CHECKMATE || game.status === GameStatus.DRAW) {
        throw new InvalidGameStateError('Cannot resign a finished game');
      }

      if (color !== "WHITE" && color !== "BLACK") {
        throw new InvalidResignationError();
      }

      game.status = GameStatus.SURRENDER;
      game.result = game.opponentColor === color ? this.WINNER_POINTS : this.LOSER_POINTS;
      
      await game.save();
      return await moveService.getState(gameId, user);
  }

  async getPlayersInformations(
    game: Game,
    user: UserToken
  ): Promise<PlayersGameInformations> {
    const whitePlayerName =
      game.opponentColor === "WHITE" ? game.opponentName : user.username;
    const blackPlayerName =
      game.opponentColor === "BLACK" ? game.opponentName : user.username;
    const capturedPiece = await moveService.getCapturedPieces(game.moves);
    return {
      whitePlayer: {
        username: whitePlayerName,
        capturedPieces: capturedPiece.white,
      },
      blackPlayer: {
        username: blackPlayerName,
        capturedPieces: capturedPiece.black,
      },
    };
  }
}

export const gameService = new GameService();
