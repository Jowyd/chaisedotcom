import httpHelper from '@/utils/httpHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

export interface LeaderboardPlayer {
  username: string;
  rating: number;
  gamesPlayed: number;
  winRate: number;
  rank?: number;
}

export interface LeaderboardFilters {
  timeRange?: 'all' | 'month' | 'week';
  page?: number;
  itemsPerPage?: number;
}

export interface LeaderboardResponse {
  players: LeaderboardPlayer[];
  total: number;
}

class LeaderboardService {
  async getLeaderboard(filters?: LeaderboardFilters): Promise<LeaderboardResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) {
        params.append('timeRange', filters.timeRange);
      }
      if (filters?.page !== undefined) {
        params.append('page', filters.page.toString());
      }
      if (filters?.itemsPerPage) {
        params.append('itemsPerPage', filters.itemsPerPage.toString());
      }

      const response = await httpHelper.get(`${API_URL}users/leaderboard?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
}

export const leaderboardService = new LeaderboardService(); 