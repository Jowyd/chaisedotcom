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

@Route("moves")
@Tags("Moves")
@Security("jwt")
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
}

export default MoveController;
