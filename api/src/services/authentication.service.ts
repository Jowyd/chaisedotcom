import { User } from "../models/user.model"; // Modèle Sequelize
import jwt from "jsonwebtoken"; // Pour générer le JWT
import { Buffer } from "buffer"; // Pour décoder Base64
import { notFound } from "../error/NotFoundError";
import { generateToken } from "../utils/JwtToken";
import { Op } from "sequelize";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../models/auth.model";

class AuthenticationService {
  // Méthode pour authentifier un utilisateur
  public async authenticateUser(request: LoginRequest): Promise<LoginResponse> {
    const { username, password } = request;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw notFound("User");
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      let error = new Error("Wrong password");
      (error as any).status = 403;
      throw error;
    }

    const token = generateToken(user.id);
    return { token, user };
  }

  public async registerUser(
    request: RegisterRequest
  ): Promise<RegisterResponse> {
    const { username, email, password } = request;

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }],
      },
    });

    if (existingUser) {
      let error = new Error("Email or username already exists");
      (error as any).status = 400;
      throw error;
    }

    const user = await User.create({ username, password });
    return { id: user.id };
  }
}

export const authService = new AuthenticationService();
