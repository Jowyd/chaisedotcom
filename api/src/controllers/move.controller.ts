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
} from "tsoa";
import moveService from "../services/move.service";
import { ChessMove } from "../interfaces/chess.interface";
import { MoveReturnDTO } from "../dto/move.dto";
import { MakeMoveDTO } from "../dto/move.dto";

@Route("moves")
@Tags("Moves")
//@Security("jwt")
export class MoveController extends Controller {
  //   @Get("/{moveId}")
  //   @Security("jwt")
  //   public async getMove(@Path() moveId: number): Promise<Move> {
  //     try {
  //       return await moveService.getMoveById(moveId);
  //     } catch (error) {
  //       this.setStatus(404);
  //       throw error;
  //     }
  //   }

  @Post("/")
  public async makeMove(@Body() move: MakeMoveDTO): Promise<MoveReturnDTO> {
    if (!move.gameId || !move.from || !move.to) {
      this.setStatus(400);
      throw new Error("Missing required fields");
    }
    return await moveService.makeMove(move);
  }
}

export default MoveController;
