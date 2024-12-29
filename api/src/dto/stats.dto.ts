export interface UserStats {
  rating: number;
  gamesPlayed: {
    total: number;
    asWhite: number;
    asBlack: number;
  };
  results: {
    wins: {
      total: number;
      asWhite: number;
      asBlack: number;
    };
    losses: {
      total: number;
      asWhite: number;
      asBlack: number;
    };
    draws: {
      total: number;
      asWhite: number;
      asBlack: number;
    };
  };
  averages: {
    movesPerGame: number;
    gameLength: string;
    capturedPieces: number;
  };
  bestWinStreak: number;
  currentStreak: number;
}
