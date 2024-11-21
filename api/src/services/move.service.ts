import { Move } from "../models/move.model";

export class MoveService {
    public async getAllMoves(): Promise<Move[]> {
        return Move.findAll();
    }

    // public async createAuthor(
    //     firstName: string,
    //     lastName: string
    // ): Promise<Move> {
    //     return Move.create({ first_name: firstName, last_name: lastName });
    // }
}

export const moveService = new MoveService();
