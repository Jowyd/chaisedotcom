import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Route,
  Path,
  Security,
  Tags,
  Request,
  Query,
  Patch,
  Queries,
} from "tsoa";
import { gameService } from "../services/game.service";
import { Game } from "../models/game.model";
import { AuthRequest } from "../dto/auth.dto";
import {
  CreateGameDTO,
  GameHistoryDTO,
  GameHistoryFiltersDTO,
  UpdateGameVisibilityDTO,
  BulkUpdateVisibilityDTO,
} from "../dto/game.dto";
import { ChessMove, ChessPiece } from "../interfaces/chess.interface";
import {
  MakeMoveDTO,
  GameReturnDTO,
  SuggestionsDTORequest,
} from "../dto/move.dto";
import moveService from "../services/move.service";
import { User } from "../models/user.model";
import { ChessColor } from "../types";

@Route("games")
@Tags("Games")
@Security("jwt")
export class GameController extends Controller {
  @Post("/")
  public async createGame(
    @Body() body: CreateGameDTO,
    @Request() req: AuthRequest
  ): Promise<{ game_id: number }> {
    try {
      const user = req.user;
      const game = await gameService.createGame(body, user);
      return { game_id: game.id };
    } catch (error) {
      this.setStatus(400);
      throw error;
    }
  }

  @Get("/{game_id}/moves")
  public async getMoves(@Path() game_id: number): Promise<ChessMove[]> {
    try {
      return await gameService.getMovesByGame(game_id);
    } catch (error) {
      this.setStatus(404);
      throw error;
    }
  }

  @Post("/{game_id}/suggestions")
  public async getSuggestions(
    @Path() game_id: number,
    @Body() body: SuggestionsDTORequest,
    @Request() req: AuthRequest
  ): Promise<String[]> {
    const user = req.user;
    return await moveService.getSuggestions(game_id, body.from, user);
  }

  @Post("/{game_id}/move")
  public async makeMove(
    @Path() game_id: number,
    @Body() move: MakeMoveDTO,
    @Request() req: AuthRequest
  ): Promise<GameReturnDTO> {
    if (!game_id || !move.from || !move.to) {
      this.setStatus(400);
      throw new Error("Missing required fields");
    }
    const user = req.user;
    return await moveService.makeMove(game_id, move, user);
  }

  @Post("/{game_id}/promotion")
  public async promotion(
    @Path() game_id: number,
    @Body() piece: ChessPiece,
    @Request() req: AuthRequest
  ): Promise<GameReturnDTO> {
    return await moveService.promotion(game_id, piece, req.user);
  }

  @Delete("/{game_id}")
  public async deleteGame(
    @Path() game_id: number,
    @Request() req: AuthRequest
  ): Promise<{ message: string }> {
    try {
      const user = req.user;
      const game = await gameService.getGameById(game_id);
      if (game.user_id !== user.id) {
        this.setStatus(403);
        throw new Error("You are not allowed to delete this game");
      }
      await gameService.deleteGame(game_id);
      return { message: "Game removed successfully" };
    } catch (error) {
      this.setStatus(404);
      throw error;
    }
  }

  @Post("/{game_id}/goto")
  public async goto(
    @Path() game_id: number,
    @Body() body: { index: number },
    @Request() req: AuthRequest
  ): Promise<GameReturnDTO> {
    if (!game_id || body.index === undefined) {
      this.setStatus(400);
      throw new Error("Missing required fields");
    }
    return await moveService.goto(game_id, body.index, req.user);
  }

  @Get("/history")
  public async getHistory(
    @Request() req: AuthRequest,
    @Queries() filters?: GameHistoryFiltersDTO
  ): Promise<GameHistoryDTO[]> {
    const user = req.user;
    return await gameService.getHistory(user.id, filters);
  }

  @Get("/public-history/:username")
  public async getPublicHistory(
    @Path() username: string,
    @Queries() filters?: GameHistoryFiltersDTO
  ): Promise<GameHistoryDTO[]> {
    return await gameService.getPublicHistory(username, filters);
  }

  @Patch("/{game_id}/visibility")
  public async updateVisibility(
    @Path() game_id: number,
    @Body() body: UpdateGameVisibilityDTO,
    @Request() req: AuthRequest
  ): Promise<void> {
    const user = req.user;
    await gameService.updateGameVisibility(game_id, body.isPublic, user.id);
  }

  @Patch("/bulk-visibility")
  public async updateBulkVisibility(
    @Body() body: BulkUpdateVisibilityDTO,
    @Request() req: AuthRequest
  ): Promise<void> {
    const user = req.user;
    await gameService.updateBulkVisibility(
      body.gameIds,
      body.isPublic,
      user.id
    );
  }

  @Get("/stats/{username}")
  public async getStats(
    @Path() username: string,
    @Request() req: AuthRequest
  ): Promise<{ stats: number }> {
    const stats = await gameService.getStats(username, req.user);
    return { stats };
  }

  @Post("/{game_id}/draw")
  public async draw(
    @Path() game_id: number,
    @Request() req: AuthRequest
  ): Promise<GameReturnDTO> {
    return await gameService.draw(game_id, req.user);
  }

  @Post("/{game_id}/resign")
  public async resign(
    @Path() game_id: number,
    @Body() body: { color: ChessColor },
    @Request() req: AuthRequest
  ): Promise<GameReturnDTO> {
    return await gameService.resign(game_id, body.color, req.user);
  }

  @Get("/{game_id}")
  public async getState(
    @Path() game_id: number,
    @Request() req: AuthRequest
  ): Promise<GameReturnDTO> {
    return await moveService.getState(game_id, req.user);
  }
}

export default GameController;
