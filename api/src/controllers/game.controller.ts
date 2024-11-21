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
} from "tsoa";
import { gameService, ChessMove } from "../services/game.service";
import { Game } from "../models/game.model";
import { AuthRequest } from "../dto/auth.dto";

interface CreateGameRequest {
  whitePlayerName: string;
  blackPlayerName: string;
  isPublic: boolean;
}

@Route("games")
@Tags("Games")
@Security("jwt")
export class GameController extends Controller {
  @Post("/")
  public async createGame(
    @Body() request: CreateGameRequest
  ): Promise<{ gameId: number }> {
    try {
      const game = await gameService.createGame(
        request.whitePlayerName,
        request.blackPlayerName,
        request.isPublic
      );

      return { gameId: game.id };
    } catch (error) {
      this.setStatus(500);
      throw error;
    }
  }

  @Get("/moves/{gameId}")
  @Security("jwt")
  public async getMoves(@Path() gameId: number): Promise<ChessMove[]> {
    try {
      return await gameService.getMovesByGame(gameId);
    } catch (error) {
      this.setStatus(404);
      throw error;
    }
  }
  //   @Get("/{gameId}")
  //   @Security("jwt")
  //   public async getGame(@Path() gameId: number): Promise<Game> {
  //     try {
  //       return await GameService.getGameById(gameId);
  //     } catch (error) {
  //       this.setStatus(404);
  //       throw error;
  //     }
  //   }

  //   @Put("/{gameId}/move")
  //   @Security("jwt")
  //   public async makeMove(
  //     @Path() gameId: number,
  //     @Body() moveData: ChessMove
  //   ): Promise<Game> {
  //     try {
  //       return await GameService.makeMove(gameId, moveData);
  //     } catch (error) {
  //       this.setStatus(400);
  //       throw error;
  //     }
  //   }

  //   @Get("/user/{userId}")
  //   @Security("jwt")
  //   public async getUserGames(@Path() userId: number): Promise<Game[]> {
  //     try {
  //       return await GameService.getUserGames(userId);
  //     } catch (error) {
  //       this.setStatus(500);
  //       throw error;
  //     }
  //   }

  @Delete("/{gameId}")
  @Security("jwt")
  public async deleteGame(
    @Path() gameId: number,
    @Request() req: AuthRequest
  ): Promise<{ message: string }> {
    try {
      const user = req.user;
      const game = await gameService.getGameById(gameId);
      if (game.user_id !== user.id) {
        this.setStatus(403);
        throw new Error("You are not allowed to delete this game");
      }
      await gameService.deleteGame(gameId);
      return { message: "Game removed successfully" };
    } catch (error) {
      this.setStatus(404);
      throw error;
    }
  }
}

export default GameController;
