import httpHelper from '@/utils/httpHelper';
import {
  GameStatus,
  type ChessColor,
  type ChessPieceNoSymbol,
  type GameHistoryFilters,
  type GameHistoryListItem,
} from '@/types';
import config from '@/config';
import { type ChessPiece } from '@/types';

const API_URL = config.API_URL;

function typeToFullName(type: string): string | undefined {
  return {
    p: 'Pawn',
    r: 'Rook',
    n: 'Knight',
    b: 'Bishop',
    q: 'Queen',
    k: 'King',
  }[type.toLowerCase()];
}

export function fullNameToSymbol(name: string): string | undefined {
  return {
    PAWN: '♟',
    ROOK: '♜',
    KNIGHT: '♞',
    BISHOP: '♝',
    QUEEN: '♛',
    KING: '♚',
  }[name.toUpperCase()];
}

let mockGameState: GameState = {
  id: 'game-1',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moves: [],
  isCheck: false,
  isCheckmate: false,
  turn: 'WHITE',
  status: GameStatus.IN_PROGRESS,
};

export interface Move {
  to: string;
  color: string;
  from: string;
  piece: string;
}

export interface CapturedPieces {
  white: ChessPieceNoSymbol[];
  black: ChessPieceNoSymbol[];
}

export interface DrawOffer {
  offeredBy: ChessColor;
  accepted?: boolean;
}

interface Player {
  username: string;
  capturedPieces: ChessPieceNoSymbol[];
}

export interface GameState {
  id: string;
  fen: string;
  moves: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  turn: ChessColor;
  status: GameStatus;
  promotion?: ChessColor | null;
  blackPlayer?: Player;
  whitePlayer?: Player;
}

export function stillPlaying(status: GameStatus): boolean {
  return status === GameStatus.IN_PROGRESS || status === GameStatus.CHECK;
}

function fenToColor(fen: string): ChessColor {
  return fen.split(' ')[1].toLowerCase() == 'w' ? 'WHITE' : 'BLACK';
}

interface CreateGameDTO {
  opponent: string;
  colorAssignment: 'random' | 'fixed';
  playerColor?: ChessColor;
  isPublic: boolean;
}

export const GameService = {
  async getGame(gameId: string): Promise<GameState> {
    try {
      const response = await httpHelper.get<GameState>(`${API_URL}games/${gameId}`);
      const game = response.data;
      const color = fenToColor(game.fen);
      return { ...mockGameState, ...game, turn: color };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getSuggestions(gameId: string, from: string): Promise<string[]> {
    try {
      const response = await httpHelper.post<string[]>(`${API_URL}games/${gameId}/suggestions`, {
        from,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async makeMove(gameId: string, move: Move): Promise<GameState> {
    try {
      const respose = await httpHelper.post<GameState>(`${API_URL}games/${gameId}/move`, move);
      const newGameState = respose.data;
      const color: ChessColor = fenToColor(newGameState.fen);

      return {
        ...mockGameState,
        ...newGameState,
        turn: color,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  async makePromotion(gameId: string, piece: ChessPiece): Promise<GameState> {
    try {
      const newPiece = {
        type: typeToFullName(piece.type)!.toUpperCase(),
        color: piece.color.toUpperCase(),
      };
      const response = await httpHelper.post<GameState>(
        `${API_URL}games/${gameId}/promotion`,
        newPiece,
      );
      const newGameState = response.data;
      const color = fenToColor(newGameState.fen);

      console.log(newGameState);
      return {
        ...mockGameState,
        ...newGameState,
        turn: color,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async resign(gameId: string, color: ChessColor): Promise<GameState> {
    try {
      const response = await httpHelper.post<GameState>(`${API_URL}games/${gameId}/resign`, {
        color,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  resetMockState(): void {
    mockGameState = {
      id: 'game-1',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: [],
      isCheck: false,
      isCheckmate: false,
      turn: 'WHITE',
      status: GameStatus.IN_PROGRESS,
    };
  },

  async goToMove(gameId: string, index: number): Promise<GameState> {
    try {
      const response = await httpHelper.post<GameState>(`${API_URL}games/${gameId}/goto`, {
        index,
      });
      const newGameState = response.data;
      const color = fenToColor(newGameState.fen);

      return {
        ...mockGameState,
        ...newGameState,
        turn: color,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async acceptDraw(gameId: string): Promise<GameState> {
    try {
      const response = await httpHelper.post<GameState>(`${API_URL}games/${gameId}/draw`, {});
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async createGame(gameDetails: CreateGameDTO): Promise<string> {
    try {
      const response = await httpHelper.post<{ game_id: string }>(`${API_URL}games`, gameDetails);
      return response.data.game_id;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  async getGameHistory(
    username: string,
    filters?: GameHistoryFilters,
  ): Promise<GameHistoryListItem> {
    const params = new URLSearchParams();

    if (filters?.page !== undefined) {
      params.append('page', filters.page.toString());
    }
    if (filters?.itemsPerPage) {
      params.append('itemsPerPage', filters.itemsPerPage.toString());
    }
    if (filters?.dateRange) {
      if (filters.dateRange[0]) {
        params.append('startDate', filters.dateRange[0].toISOString());
      }
      if (filters.dateRange[1]) {
        params.append('endDate', filters.dateRange[1].toISOString());
      }
    }
    if (filters?.result) {
      params.append('result', filters.result);
    }

    const response = await httpHelper.get<GameHistoryListItem>(
      `${API_URL}users/${username}/games?${params.toString()}`,
    );
    return response.data;
  },

  async updateGameVisibility(gameId: number, isPublic: boolean): Promise<void> {
    try {
      await httpHelper.patch(`${API_URL}games/${gameId}/visibility`, { isPublic });
    } catch (error) {
      console.error('Error updating game visibility:', error);
      throw error;
    }
  },

  async updateBulkGameVisibility(gameIds: number[], isPublic: boolean): Promise<void> {
    try {
      await httpHelper.patch(`${API_URL}games/bulk-visibility`, { gameIds, isPublic });
    } catch (error) {
      console.error('Error updating bulk game visibility:', error);
      throw error;
    }
  },
};
