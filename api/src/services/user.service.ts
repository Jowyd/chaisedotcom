import {
  UserOutputDTO,
  UserProfile,
  PasswordUpdate,
  PrivacySettings,
} from "../dto/user.dto";
import { notFound, unauthorized } from "../error/NotFoundError";
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

export class UserService {
  public async getAllUsers(): Promise<UserOutputDTO[]> {
    let userList = await User.findAll();
    return UserMapper.toOutputDtoList(userList);
  }

  public async getUserById(id: number): Promise<UserOutputDTO> {
    let user = await User.findByPk(id);
    if (user) {
      return UserMapper.toOutputDto(user);
    } else {
      notFound("User");
    }
  }

  public async createUser(
    username: string,
    password: string
  ): Promise<UserOutputDTO> {
    return UserMapper.toOutputDto(
      await User.create({ username: username, password: password })
    );
  }

  public async deleteUser(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (user) {
      user.destroy();
    } else {
      notFound("User");
    }
  }

  public async updateUser(
    id: number,
    username?: string,
    password?: string
  ): Promise<UserOutputDTO> {
    const user = await User.findByPk(id);
    if (user) {
      if (username) user.username = username;
      if (password) user.password = password;
      await user.save();
      return UserMapper.toOutputDto(user);
    } else {
      notFound("User");
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
      return notFound("User");
    }
    if (!user.public_profile && user.id !== authUser.id) {
      return unauthorized();
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
      return notFound("User");
    }

    const existingUser = await User.findOne({
      where: { username: newUsername },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new Error("Username already taken");
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
      return notFound("User");
    }

    const isValidPassword = await user.validatePassword(
      passwords.currentPassword
    );
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
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
    const whereClause: any = {};

    if (timeRange && timeRange !== "all") {
      const startDate =
        timeRange === "month"
          ? new Date(new Date().setMonth(new Date().getMonth() - 1))
          : new Date(new Date().setDate(new Date().getDate() - 7));

      whereClause.created_at = {
        [Op.gte]: startDate,
      };
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
  }

  public async getStats(
    username: string,
    authUser: UserToken
  ): Promise<UserStats> {
    const user = await User.findOne({ where: { username } });
    if (user?.username !== authUser.username && !user?.public_profile) {
      return unauthorized();
    }
    if (!user) {
      return notFound(`User: ${username}`);
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
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return notFound("User");
    }
    const userId = user.id;
    const whereClause: any = {
      user_id: userId,
    };
    const page = filters?.page || 0;
    const itemsPerPage = filters?.itemsPerPage || 50;

    if (user.username !== authUser.username) {
      if (!user.public_profile) {
        return notFound("User");
      }
      if (!user.show_game_history) {
        return { games: [], total: 0 };
      }
      whereClause.isPublic = true;
    }

    if (filters) {
      if (filters.startDate && filters.endDate) {
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
  }
}

export const userService = new UserService();
