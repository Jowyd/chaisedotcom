import type { UserStats } from '@/types';
import httpHelper from '@/utils/httpHelper';
import config from '@/config';

const API_URL = config.API_URL;

export interface UserProfile {
  username: string;
  createdAt: string;
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

export interface PrivacySettings {
  publicProfile: boolean;
  showGameHistory: boolean;
}

class UserService {
  async getProfile(username: string): Promise<UserProfile> {
    try {
      const response = await httpHelper.get(`${API_URL}users/profile/${username}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateUsername(newUsername: string): Promise<void> {
    try {
      await httpHelper.patch(`${API_URL}users/me/username`, { username: newUsername });
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  }

  async updatePassword(passwords: PasswordUpdate): Promise<void> {
    try {
      await httpHelper.patch(`${API_URL}users/me/password`, passwords);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async updatePrivacySettings(settings: PrivacySettings): Promise<void> {
    try {
      await httpHelper.patch(`${API_URL}users/me/privacy`, settings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  async getUserStats(username: string): Promise<UserStats> {
    try {
      const response = await httpHelper.get(`${API_URL}users/${username}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
