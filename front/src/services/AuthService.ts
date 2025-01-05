import httpHelper from '@/utils/httpHelper';
import { jwtDecode } from 'jwt-decode';

import config from '@/config';

const API_URL = config.API_URL;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
  }

  private saveTokens(tokens: AuthTokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async login(credentials: UserCredentials): Promise<void> {
    try {
      const response = await httpHelper.post(`${API_URL}auth/login`, credentials);
      console.log(response);
      const { accessToken, refreshToken, user } = response.data;

      this.saveTokens({ accessToken, refreshToken });
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      console.log(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(credentials: UserCredentials): Promise<void> {
    try {
      const response = await httpHelper.post(`${API_URL}auth/register`, credentials);
      const { user, ...tokens } = response.data;
      this.saveTokens(tokens);
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  logout(): void {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user && !this.isTokenExpired(this.accessToken);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getUser(): User | null {
    return this.user;
  }

  setUser(user: User): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await httpHelper.post(`${API_URL}auth/refresh`, {
        refreshToken: this.refreshToken,
      });
      const { accessToken, refreshToken } = response.data;
      this.saveTokens({ accessToken, refreshToken });
      return accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
}

export const authService = new AuthService();
