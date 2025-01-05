import { Route, Controller, Post, Body } from "tsoa";
import { authService } from "../services/authentication.service";
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from "../dto/auth.dto";

@Route("auth")
export class AuthController extends Controller {
  @Post("/login")
  public async login(
    @Body() request: LoginRequest
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    return await authService.authenticateUser(request);
  }

  @Post("/register")
  public async register(
    @Body() request: RegisterRequest
  ): Promise<RegisterResponse> {
    return await authService.registerUser(request);
  }
  @Post("/refresh")
  public async refresh(
    @Body() body: { refreshToken: string }
  ): Promise<{ accessToken: string }> {
    console.log(body);
    return await authService.refreshToken(body.refreshToken);
  }
}
