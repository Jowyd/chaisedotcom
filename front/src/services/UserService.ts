import httpHelper from '@/utils/httpHelper';
import type { User } from './AuthService';

export const UserService = {
  async getProfile(): Promise<User> {
    try {
      const response = await httpHelper.get<User>(`/profile`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
