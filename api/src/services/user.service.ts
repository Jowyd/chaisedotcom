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

export class UserService {
  // Récupère tous les utilisateurs
  public async getAllUsers(): Promise<UserOutputDTO[]> {
    let userList = await User.findAll();
    return UserMapper.toOutputDtoList(userList);
  }

  // Récupère un utilisateur par ID
  public async getUserById(id: number): Promise<UserOutputDTO> {
    let user = await User.findByPk(id);
    if (user) {
      return UserMapper.toOutputDto(user);
    } else {
      notFound("User");
    }
  }

  // Crée un nouvel utilisateur
  public async createUser(
    username: string,
    password: string
  ): Promise<UserOutputDTO> {
    return UserMapper.toOutputDto(
      await User.create({ username: username, password: password })
    );
  }

  // Supprime un utilisateur par ID
  public async deleteUser(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (user) {
      user.destroy();
    } else {
      notFound("User");
    }
  }

  // Met à jour un utilisateur
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

  // Récupère le profil d'un utilisateur
  public async getProfile(username: string): Promise<UserProfile> {
    const user = await User.findOne({
      where: { username },
      attributes: [
        "username",
        "created_at",
        "publicProfile",
        "showGameHistory",
      ],
    });

    if (!user) {
      return notFound("User");
    }

    return {
      username: user.username,
      createdAt: user.created_at,
      publicProfile: user.public_profile,
      showGameHistory: user.show_game_history,
    };
  }

  // Met à jour le nom d'utilisateur
  public async updateUsername(
    userId: number,
    newUsername: string
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      return notFound("User");
    }

    // Vérifier si le nouveau nom d'utilisateur est déjà pris
    const existingUser = await User.findOne({
      where: { username: newUsername },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new Error("Username already taken");
    }

    user.username = newUsername;
    await user.save();
  }

  // Met à jour le mot de passe
  public async updatePassword(
    userId: number,
    passwords: PasswordUpdate
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      return notFound("User");
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await user.validatePassword(
      passwords.currentPassword
    );
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(passwords.newPassword, salt);
    await user.save();
  }

  // Met à jour les paramètres de confidentialité
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
          ), // Rating de base: 1500
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
}

export const userService = new UserService();
