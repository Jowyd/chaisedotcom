import jwt from "jsonwebtoken";
import { config } from "../config/variables";

export function generateToken(payload: any): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRATION,
  });
}

export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET!);
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}
