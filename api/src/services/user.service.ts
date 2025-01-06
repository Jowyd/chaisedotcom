import {
  UserOutputDTO,
  UserProfile,
  PasswordUpdate,
  PrivacySettings,
} from "../dto/user.dto";
import { notFound } from "../error/NotFoundError";
import { UserMapper } from "../mapper/user.mapper";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { Game } from "../models/game.model";
import { LeaderboardPlayer, LeaderboardResponse } from "../dto/leaderboard.dto";
import { UserStats } from "../dto/stats.dto";
import Move from "../models/move.model";
import { stat } from "fs";
import { GameStatus } from "../enums/gameStatus.enum";
import {
  GameHistoryDTO,
  GameHistoryFiltersDTO,
  GameHistoryListDTO,
} from "../dto/game.dto";
import { UserToken } from "../dto/auth.dto";
import {
  BaseError,
  UserNotFoundError,
  UsernameConflictError,
  InvalidPasswordError,
  PrivacyViolationError,
  UserCreationError,
  UserDeletionError,
  UserUpdateError,
  LeaderboardError,
  GameHistoryAccessError,
  InvalidDateRangeError,
} from "../error/custom-error";

export class UserService {
  public async getAllUsers(): Promise<UserOutputDTO[]> {
    try {
      let userList = await User.findAll();
      return UserMapper.toOutputDtoList(userList);
    } catch (error) {
      throw new BaseError("Failed to fetch users", 500, "USERS_FETCH_ERROR");
    }
  }

  public async getUserById(id: number): Promise<UserOutputDTO> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }
    return UserMapper.toOutputDto(user);
  }

  public async createUser(
    username: string,
    password: string
  ): Promise<UserOutputDTO> {
    try {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        throw new UsernameConflictError(username);
      }

      const user = await User.create({ username, password });
      return UserMapper.toOutputDto(user);
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new UserCreationError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  public async deleteUser(id: number): Promise<void> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new UserNotFoundError(id);
      }
      await user.destroy();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw error;
      }
      throw new UserDeletionError(id);
    }
  }

  public async updateUser(
    id: number,
    username?: string,
    password?: string
  ): Promise<UserOutputDTO> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new UserNotFoundError(id);
      }

      if (username) {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser && existingUser.id !== id) {
          throw new UsernameConflictError(username);
        }
        user.username = username;
      }

      if (password) {
        user.password = password;
      }

      await user.save();
      return UserMapper.toOutputDto(user);
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new UserUpdateError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  public async getProfile(
    username: string,
    authUser: UserToken
  ): Promise<UserProfile> {
    const user = await User.findOne({
      where: { username },
      attributes: [
        "username",
        "created_at",
        "public_profile",
        "show_game_history",
      ],
    });

    if (!user) {
      throw new UserNotFoundError(username);
    }

    if (!user.public_profile && user.id !== authUser.id) {
      throw new PrivacyViolationError();
    }

    return {
      username: user.username,
      createdAt: user.created_at,
      publicProfile: user.public_profile,
      showGameHistory: user.show_game_history,
    };
  }

  public async updateUsername(
    userId: number,
    newUsername: string
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const existingUser = await User.findOne({
      where: { username: newUsername },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new UsernameConflictError(newUsername);
    }

    user.username = newUsername;
    await user.save();
  }

  public async updatePassword(
    userId: number,
    passwords: PasswordUpdate
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const isValidPassword = await user.validatePassword(
      passwords.currentPassword
    );
    if (!isValidPassword) {
      throw new InvalidPasswordError();
    }

    user.password = passwords.newPassword;
    await user.save();
  }

  public async updatePrivacySettings(
    userId: number,
    settings: PrivacySettings
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      return notFound("User");
    }

    user.public_profile = settings.publicProfile;
    user.show_game_history = settings.showGameHistory;
    await user.save();
  }

  public async getLeaderboard(
    timeRange?: string,
    page: number = 0,
    itemsPerPage: number = 10
  ): Promise<LeaderboardResponse> {
    try {
      const whereClause: any = {};

      if (timeRange && timeRange !== "all") {
        if (!["week", "month"].includes(timeRange)) {
          throw new BaseError(
            'Invalid time range. Allowed values are: "week", "month", "all"',
            400,
            "INVALID_TIME_RANGE"
          );
        }

        const startDate =
          timeRange === "month"
            ? new Date(new Date().setMonth(new Date().getMonth() - 1))
            : new Date(new Date().setDate(new Date().getDate() - 7));

        whereClause.created_at = {
          [Op.gte]: startDate,
        };
      }

      if (page < 0 || itemsPerPage < 1) {
        throw new BaseError(
          "Invalid pagination parameters",
          400,
          "INVALID_PAGINATION"
        );
      }

      const { count, rows: users } = await User.findAndCountAll({
        include: [
          {
            model: Game,
            as: "games",
            where: whereClause,
            required: false,
          },
        ],
        limit: itemsPerPage,
        offset: page * itemsPerPage,
      });

      const players = users
        .map((user) => {
          const games = user.games || [];
          const totalGames = games.length;
          const wins = games.filter(
            (game: Game) => game.result != null && game.result > 0
          ).length;

          return {
            username: user.username,
            rating: games.reduce(
              (sum: number, game: Game) => sum + (game.result || 0),
              1500
            ),
            gamesPlayed: totalGames,
            winRate: totalGames ? (wins / totalGames) * 100 : 0,
          };
        })
        .sort((a, b) => b.rating - a.rating);

      return {
        players,
        total: count,
      };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }

      throw new LeaderboardError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  public async getStats(
    username: string,
    authUser: UserToken
  ): Promise<UserStats> {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new UserNotFoundError(username);
    }

    if (user?.username !== authUser.username && !user?.public_profile) {
      throw new PrivacyViolationError();
    }

    const games = await Game.findAll({
      where: {
        [Op.or]: [{ user_id: user.id }, { opponentName: username }],
      },
      include: [
        {
          model: Move,
          as: "moves",
        },
      ],
    });

    const stats: UserStats = {
      rating: 1500,
      gamesPlayed: {
        total: games.length,
        asWhite: 0,
        asBlack: 0,
      },
      results: {
        wins: { total: 0, asWhite: 0, asBlack: 0 },
        losses: { total: 0, asWhite: 0, asBlack: 0 },
        draws: { total: 0, asWhite: 0, asBlack: 0 },
      },
      averages: {
        movesPerGame: 0,
        gameLength: "00:00",
        capturedPieces: 0,
      },
      bestWinStreak: 0,
      currentStreak: 0,
    };

    let totalMoves = 0;
    let totalCaptures = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let lastGameWon = false;

    games.forEach((game) => {
      stats.rating += game.result || 0;
      const isPlayer = game.user_id === user.id;
      const playerColor = isPlayer
        ? game.opponentColor === "WHITE"
          ? "BLACK"
          : "WHITE"
        : game.opponentColor;

      if (playerColor === "WHITE") {
        stats.gamesPlayed.asWhite++;
      } else {
        stats.gamesPlayed.asBlack++;
      }

      if (game.result !== null) {
        const gameResult = game.result * (isPlayer ? 1 : -1);
        if (gameResult > 0) {
          stats.results.wins.total++;
          if (playerColor === "WHITE") {
            stats.results.wins.asWhite++;
          } else {
            stats.results.wins.asBlack++;
          }
          currentStreak = lastGameWon ? currentStreak + 1 : 1;
          lastGameWon = true;
        } else if (gameResult < 0) {
          stats.results.losses.total++;
          if (playerColor === "WHITE") {
            stats.results.losses.asWhite++;
          } else {
            stats.results.losses.asBlack++;
          }
          currentStreak = 0;
          lastGameWon = false;
        } else {
          stats.results.draws.total++;
          if (playerColor === "WHITE") {
            stats.results.draws.asWhite++;
          } else {
            stats.results.draws.asBlack++;
          }
          currentStreak = 0;
          lastGameWon = false;
        }

        bestStreak = Math.max(bestStreak, currentStreak);
      }

      if (game.moves) {
        totalMoves += game.moves.length;
        totalCaptures += game.moves.filter(
          (move) => move.type === "capture"
        ).length;
      }
    });

    if (stats.gamesPlayed.total > 0) {
      stats.averages.movesPerGame = Math.round(
        totalMoves / stats.gamesPlayed.total
      );
      stats.averages.capturedPieces = Math.round(
        totalCaptures / stats.gamesPlayed.total
      );
      stats.averages.gameLength = "15:30"; // Temps moyen fixe pour le moment
    }

    stats.bestWinStreak = bestStreak;
    stats.currentStreak = currentStreak;

    return stats;
  }

  async getHistory(
    username: string,
    authUser: UserToken,
    filters?: GameHistoryFiltersDTO
  ): Promise<GameHistoryListDTO> {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new UserNotFoundError(username);
      }

      if (user.username !== authUser.username) {
        if (!user.public_profile) {
          throw new PrivacyViolationError();
        }
        if (!user.show_game_history) {
          throw new GameHistoryAccessError();
        }
      }

      const whereClause: any = {
        user_id: user.id,
      };

      if (filters) {
        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);

          if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            throw new InvalidDateRangeError();
          }

          whereClause.created_at = {
            [Op.between]: [start, end],
          };
        }

        if (filters.result) {
          if (!["won", "lost", "draw"].includes(filters.result)) {
            throw new BaseError(
              'Invalid result filter. Allowed values are: "won", "lost", "draw"',
              400,
              "INVALID_RESULT_FILTER"
            );
          }
        }

        whereClause.isPublic = filters.isPublic ?? true;
      }

      const page = filters?.page || 0;
      const itemsPerPage = filters?.itemsPerPage || 50;

      if (page < 0 || itemsPerPage < 1) {
        throw new BaseError(
          "Invalid pagination parameters",
          400,
          "INVALID_PAGINATION"
        );
      }

      const games = await Game.findAll({
        where: whereClause,
        order: [["created_at", "DESC"]],
        include: [{ model: Move, as: "moves" }],
        limit: itemsPerPage,
        offset: page,
      });

      const total = await Game.count({ where: whereClause });
      const gameHistory: GameHistoryDTO[] = games.map((game) => ({
        game_id: game.id,
        opponentName: game.opponentName,
        opponentColor: game.opponentColor,
        isPublic: game.isPublic,
        result: game.result,
        status: game.status,
        createdAt: game.created_at,
        moves: game.moves?.length || 0,
      }));

      return { games: gameHistory, total };
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BaseError(
        "Failed to fetch game history",
        500,
        "GAME_HISTORY_ERROR"
      );
    }
  }
}

export const userService = new UserService();
