import { Controller, Get, Post, Delete, Route, Path, Body, Tags, Patch } from "tsoa";
import { MoveDTO } from "../dto/move.dto";
import { moveService } from "../services/move.service";

@Route("moves")
@Tags("Moves")
export class MoveController extends Controller {

    @Get("/")
    public async getAllMoves(): Promise<MoveDTO[]> {
        return moveService.getAllMoves();
    }

    // @Get("{id}")
    // public async getAuthorById(@Path() id: number): Promise<AuthorDTO | null> {
    //     const author = await authorService.getAuthorById(id);

    //     if (!author) {
    //         const error = new Error('Author not found');
    //         (error as any).status = 404;
    //         throw error;
    //     }
    //     return author;
    // }

    //@Post("/")
    // public async createMove(
    //     @Body() requestBody: MoveDTO
    // ): Promise<MoveDTO> {

    // }
}
