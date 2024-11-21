import jwt from "jsonwebtoken";
import { config } from "../config/variables";
import { Token } from "../dto/auth.dto";

export function generateToken(payload: Token): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: "1h",
  });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET!);
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}
