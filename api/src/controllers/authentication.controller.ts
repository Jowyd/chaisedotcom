import { Route, Controller, Post, Body } from "tsoa";
import { AuthenticationInputDTO } from "../dto/authentication.dto";
import { authService } from "../services/authentication.service";
import { generateToken } from "../utils/JwtToken";
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from "../models/auth.model";

@Route("auth")
export class AuthController extends Controller {
  @Post("/login")
  public async login(
    @Body() request: LoginRequest
  ): Promise<{ token: string }> {
    return await authService.authenticateUser(request);
  }

  @Post("/register")
  public async register(
    @Body() request: RegisterRequest
  ): Promise<RegisterResponse> {
    return await authService.registerUser(request);
  }
}
