import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Route,
  SuccessResponse,
  Patch,
  Delete,
} from "tsoa";
import { userService } from "../services/user.service";
import {
  UserInputDTO,
  UserOutputDTO,
  UserInputPatchDTO,
} from "../dto/user.dto";

@Route("users")
export class UsersController extends Controller {
  @Get("/")
  public async getAllUsers(): Promise<UserOutputDTO[]> {
    return userService.getAllUsers();
  }

  // Récupère un utilisateur par ID
  @Get("{id}")
  public async getUserById(@Path() id: number): Promise<UserOutputDTO> {
    return userService.getUserById(id);
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
}
