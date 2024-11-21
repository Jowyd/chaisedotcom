import { User } from "../models/user.model";
import { UserOutputDTO } from "./user.dto";
import express from "express";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserOutputDTO;
}

export interface RegisterResponse {
  user: UserOutputDTO;
}

export interface Token {
  id: number;
  username: string;
}

export interface AuthRequest extends express.Request {
  user: Token;
}
