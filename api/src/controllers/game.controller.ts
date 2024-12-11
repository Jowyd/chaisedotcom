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
import { gameService } from "../services/game.service";
import { Game } from "../models/game.model";
import { AuthRequest } from "../dto/auth.dto";
import { CreateGameDTO, GameHistoryDTO } from "../dto/game.dto";
import { ChessMove } from "../interfaces/chess.interface";
import {
  MakeMoveDTO,
  MoveReturnDTO,
  SuggestionsDTORequest,
} from "../dto/move.dto";
import moveService from "../services/move.service";

@Route("games")
@Tags("Games")
//@Security("jwt")
export class GameController extends Controller {
  @Post("/")
  public async createGame(
    @Body() dto: CreateGameDTO
  ): Promise<{ game_id: number; initialBoard: MoveReturnDTO }> {
    try {
      const game = await gameService.createGame(dto);
      const initialBoard = await moveService.getInitialBoard(game);

      return { game_id: game.id, initialBoard: initialBoard };
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
    @Body() body: SuggestionsDTORequest
  ): Promise<String[]> {
    console.log("game_id", game_id, "from", body.from);
    return await moveService.getSuggestions(game_id, body.from);
  }

  @Post("/{game_id}/move")
  public async makeMove(
    @Path() game_id: number,
    @Body() move: MakeMoveDTO
  ): Promise<MoveReturnDTO> {
    console.log(move);
    if (!game_id || !move.from || !move.to) {
      this.setStatus(400);
      throw new Error("Missing required fields");
    }
    console.log("game_id", game_id, "move", move);
    return await moveService.makeMove(game_id, move);
  }

  @Get("/{game_id}")
  public async getState(@Path() game_id: number): Promise<MoveReturnDTO> {
    return await moveService.getState(game_id);
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

  @Get("/history")
  public async getHistory(
    @Request() req: AuthRequest
  ): Promise<GameHistoryDTO[]> {
    const user = req.user;
    return await gameService.getHistory(user.id);
  }

  @Get("/stats/{username}")
  public async getStats(@Path() username: string): Promise<{ stats: number }> {
    const stats = await gameService.getStats(username);
    return { stats };
  }
}

export default GameController;
