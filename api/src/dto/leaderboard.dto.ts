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