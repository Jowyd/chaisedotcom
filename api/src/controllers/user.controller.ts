import {
  Controller,
  Get,
  Post,
  Delete,
  Route,
  Path,
  Body,
  Tags,
  Patch,
  Security,
  Request,
  Query,
  Queries,
} from "tsoa";
import { userService } from "../services/user.service";
import * as express from "express";
import {
  UserInputDTO,
  UserInputPatchDTO,
  UserOutputDTO,
  UserProfile,
  PasswordUpdate,
  PrivacySettings,
} from "../dto/user.dto";
import { AuthRequest } from "../dto/auth.dto";
import { LeaderboardPlayer, LeaderboardResponse } from "../dto/leaderboard.dto";
import { UserStats } from "../dto/stats.dto";
import { GameHistoryDTO, GameHistoryFiltersDTO } from "../dto/game.dto";

@Route("users")
@Tags("Users")
@Security("jwt")
export class UserController extends Controller {
  // Récupère tous les utilisateurs

  @Get("/info")
  public async getUserInfo(@Request() req: AuthRequest): Promise<void> {
    console.log((req as any).user);
  }

  @Get("/")
  public async getAllUsers(): Promise<UserOutputDTO[]> {
    return userService.getAllUsers();
  }

  // Crée un nouvel utilisateur
  @Post("/")
  public async createUser(
    @Body() requestBody: UserInputDTO
  ): Promise<UserOutputDTO> {
    const { username, password } = requestBody;
    return userService.createUser(username, password);
  }

  // Supprime un utilisateur par ID
  @Delete("{id}")
  public async deleteUser(@Path() id: number): Promise<void> {
    await userService.deleteUser(id);
  }

  // Met à jour un utilisateur par ID
  @Patch("{id}")
  public async updateUser(
    @Path() id: number,
    @Body() requestBody: UserInputPatchDTO
  ): Promise<UserOutputDTO> {
    const { username, password } = requestBody;
    return userService.updateUser(id, username, password);
  }

  @Get("/me")
  public async getMe(@Request() req: AuthRequest): Promise<UserOutputDTO> {
    const { id } = req.user;
    return userService.getUserById(id);
  }

  @Get("/profile/{username}")
  public async getProfile(@Path() username: string): Promise<UserProfile> {
    return await userService.getProfile(username);
  }

  @Patch("/me/username")
  public async updateUsername(
    @Request() req: AuthRequest,
    @Body() body: { username: string }
  ): Promise<void> {
    await userService.updateUsername(req.user.id, body.username);
  }

  @Patch("/me/password")
  public async updatePassword(
    @Request() req: AuthRequest,
    @Body() body: PasswordUpdate
  ): Promise<void> {
    await userService.updatePassword(req.user.id, body);
  }

  @Patch("/me/privacy")
  public async updatePrivacySettings(
    @Request() req: AuthRequest,
    @Body() body: PrivacySettings
  ): Promise<void> {
    await userService.updatePrivacySettings(req.user.id, body);
  }

  @Get("/leaderboard")
  public async getLeaderboard(
    @Query() timeRange?: string,
    @Query() page?: number,
    @Query() itemsPerPage?: number
  ): Promise<LeaderboardResponse> {
    const { players, total } = await userService.getLeaderboard(
      timeRange,
      page,
      itemsPerPage
    );
    return { players, total };
  }

  @Get("{username}/stats")
  public async getStats(
    @Path() username: string,
    @Request() req: AuthRequest
  ): Promise<UserStats> {
    const authUser = req.user;
    return await userService.getStats(username, authUser);
  }

  @Get("{username}/games")
  public async getUserGames(
    @Path() username: string,
    @Request() req: AuthRequest,
    @Queries() filters?: GameHistoryFiltersDTO
  ): Promise<GameHistoryDTO[]> {
    const authUser = req.user;
    return await userService.getHistory(username, authUser, filters);
  }
}
