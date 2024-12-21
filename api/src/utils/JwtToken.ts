import jwt from "jsonwebtoken";
import { config } from "../config/variables";
import { Token } from "../dto/auth.dto";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';

export const generateToken = (user: any): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
};

export const generateRefreshToken = (user: any): string => {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export function verifyToken(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET!);
}

export function decodeToken(token: string) {
  return jwt.decode(token);
}
