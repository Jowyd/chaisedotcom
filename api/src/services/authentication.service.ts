import { User } from "../models/user.model";
import jwt, { JsonWebTokenError } from "jsonwebtoken"; 
import { Buffer } from "buffer";
import { notFound } from "../error/NotFoundError";
import { generateToken, generateRefreshToken } from "../utils/JwtToken";
import { Op } from "sequelize";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../dto/auth.dto";
import { AuthenticationError, BaseError, InvalidCredentialsError, InvalidRefreshTokenError, MissingTokenError, TokenError, UserExistsError } from "../error/custom-error";

class AuthenticationService {
  public async authenticateUser(request: LoginRequest): Promise<LoginResponse> {
    try {
      const { username, password } = request;

      if (!username || !password) {
        throw new InvalidCredentialsError();
      }

      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new InvalidCredentialsError();
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new InvalidCredentialsError();
      }

      const userData = {
        id: user.id,
        username: user.username,
      };

      const accessToken = generateToken(userData);
      const refreshToken = generateRefreshToken(userData);

      return {
        accessToken,
        refreshToken,
        user: userData,
      };
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new AuthenticationError(
        error instanceof Error ? error.message : 'Authentication failed'
      );
    }
  }

  public async registerUser(
    request: RegisterRequest
  ): Promise<RegisterResponse> {
    try {
      const { username, password } = request;

      if (!username || !password) {
        throw new BaseError(
          'Username and password are required',
          400,
          'INVALID_INPUT'
        );
      }

      if (password.length < 8) {
        throw new BaseError(
          'Password must be at least 8 characters long',
          400,
          'INVALID_PASSWORD'
        );
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }],
        },
      });

      if (existingUser) {
        throw new UserExistsError('username');
      }

      const user = await User.create({ username, password });
      return { user };
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BaseError(
        `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        'REGISTRATION_FAILED'
      );
    }
  }

  public getRefreshToken(): string {
    try {
      const refreshTokenEnv = process.env.REFRESH_TOKEN;
      if (!refreshTokenEnv) {
        throw new TokenError('Refresh token configuration is missing');
      }

      const tokenParts = refreshTokenEnv.split(' ');
      if (tokenParts.length !== 2) {
        throw new TokenError('Invalid refresh token configuration format');
      }

      return Buffer.from(tokenParts[1], 'base64').toString();
    } catch (error: unknown) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new TokenError(
        error instanceof Error ? error.message : 'Failed to get refresh token'
      );
    }
  }

  public async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    try {
      if (!refreshToken) {
        throw new MissingTokenError();
      }

      const decoded = jwt.verify(
        refreshToken,
        this.getRefreshToken()
      ) as jwt.JwtPayload;

      if (!decoded || !decoded.id || !decoded.username) {
        throw new InvalidRefreshTokenError();
      }

      const userData = {
        id: decoded.id,
        username: decoded.username,
      };

      // Verify user still exists
      const user = await User.findByPk(userData.id);
      if (!user) {
        throw new InvalidRefreshTokenError();
      }

      const accessToken = generateToken(userData);
      return { accessToken };
    } catch (error: unknown) {
      if (error instanceof JsonWebTokenError) {
        throw new InvalidRefreshTokenError();
      }
      if (error instanceof BaseError) {
        throw error;
      }
      throw new TokenError(
        error instanceof Error ? error.message : 'Token refresh failed'
      );
    }
  }
}

export const authService = new AuthenticationService();
