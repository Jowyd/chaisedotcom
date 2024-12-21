import httpHelper from '@/utils/httpHelper';
import { GameStatus } from '@/types';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

interface ChessPiece {
  type: string;
  color: 'white' | 'black';
  symbol: string;
}

function typeToFullName(type: string): string | undefined {
  return {
    p: 'Pawn',
    r: 'Rook',
    n: 'Knight',
    b: 'Bishop',
    q: 'Queen',
    k: 'King',
  }[type];
}

const pieces: { [key: string]: string } = {
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  p: '♟',
};

let mockGameState: GameState = {
  id: 'game-1',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moves: [],
  isCheck: false,
  isCheckmate: false,
  turn: 'white',
  status: GameStatus.IN_PROGRESS,
};

export interface Move {
  to: string;
  color: string;
  from: string;
  piece: string;
}

export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

export interface DrawOffer {
  offeredBy: 'white' | 'black';
  accepted?: boolean;
}

interface Player {
  username: string;
}

export interface GameState {
  id: string;
  fen: string;
  moves: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  turn: 'white' | 'black';
  status: GameStatus;
  promotion?: 'white' | 'black' | null;
  blackPlayer?: Player;
  whitePlayer?: Player;
}

export function stillPlaying(status: GameStatus): boolean {
  return status === GameStatus.IN_PROGRESS || status === GameStatus.CHECK;
}

function fenToColor(fen: string): string {
  return fen.split(' ')[1];
}
function getPiecefromFen(char: string): ChessPiece {
  return {
    type: char.toLowerCase(),
    color: char === char.toLowerCase() ? 'black' : 'white',
    symbol: pieces[char.toLowerCase()],
  };
}
function extractCapturedPiece(currentFen: string): CapturedPieces {
  const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const extractPieces = (fen: string) => {
    const boardPart = fen.split(' ')[0];
    const pieces: string[] = [];

    boardPart.split('/').forEach((row) => {
      row.split('').forEach((char) => {
        if (isNaN(parseInt(char))) {
          pieces.push(char);
        }
      });
    });
    return pieces;
  };

  const initialPieces = extractPieces(initialFen);
  const currentPieces = extractPieces(currentFen);

  const capturedPieces = findMissingPieces(initialPieces, currentPieces);

  return {
    white: capturedPieces.filter((piece) => piece.color === 'white'),
    black: capturedPieces.filter((piece) => piece.color === 'black'),
  };
}

function findMissingPieces(initialPieces: string[], currentPieces: string[]): ChessPiece[] {
  const initialPieceCount = new Map<string, number>();
  const currentPieceCount = new Map<string, number>();

  initialPieces.forEach((piece) => {
    initialPieceCount.set(piece, (initialPieceCount.get(piece) || 0) + 1);
  });

  currentPieces.forEach((piece) => {
    currentPieceCount.set(piece, (currentPieceCount.get(piece) || 0) + 1);
  });

  const missingPieces: ChessPiece[] = [];

  initialPieceCount.forEach((count, piece) => {
    const currentCount = currentPieceCount.get(piece) || 0;
    const missingCount = count - currentCount;

    for (let i = 0; i < missingCount; i++) {
      missingPieces.push(getPiecefromFen(piece));
    }
  });

  return missingPieces;
}

interface CreateGameDTO {
  opponent: string;
  colorAssignment: 'random' | 'fixed';
  playerColor?: 'white' | 'black';
}

export const GameService = {
  async getGame(gameId: string): Promise<GameState> {
    try {
      const response = await httpHelper.get(`${API_URL}games/${gameId}`);
      const game = response.data;
      const color = fenToColor(game.fen) == 'w' ? 'white' : 'black';
      console.log(game);
      return { ...mockGameState, ...game, turn: color };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getCapturedPieces(fen: string): CapturedPieces {
    const capturedPieces = extractCapturedPiece(fen);
    return capturedPieces;
  },
  async getSuggestions(gameId: string, from: string): Promise<string[]> {
    try {
      const response = await httpHelper.post(`${API_URL}games/${gameId}/suggestions`, {
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
      const respose = await httpHelper.post(`${API_URL}games/${gameId}/move`, move);
      const newGameState = respose.data;
      const color = fenToColor(newGameState.fen) == 'w' ? 'white' : 'black';

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
      const response = await httpHelper.post(`${API_URL}games/${gameId}/promotion`, newPiece);
      const newGameState = response.data;
      const color = fenToColor(newGameState.fen) == 'w' ? 'white' : 'black';

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

  async resign(gameId: string, color: 'white' | 'black'): Promise<GameState> {
    try {
      const response = await httpHelper.post(`${API_URL}games/${gameId}/resign`, { color });
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
      turn: 'white',
      status: GameStatus.IN_PROGRESS,
    };
  },

  async goToMove(gameId: string, index: number): Promise<GameState> {
    try {
      const response = await httpHelper.post(`${API_URL}games/${gameId}/goto`, { index });
      const newGameState = response.data;
      const color = fenToColor(newGameState.fen) == 'w' ? 'white' : 'black';

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
      const response = await httpHelper.post(`${API_URL}games/${gameId}/draw`, {});
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async createGame(gameDetails: CreateGameDTO): Promise<GameState> {
    try {
      const response = await httpHelper.post(`${API_URL}games`, gameDetails);
      const newGame = response.data;
      return {
        ...mockGameState,
        ...newGame,
        id: newGame.game_id.toString(),
      };
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },
};
