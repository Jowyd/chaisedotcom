import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

interface ChessPiece {
  type: string;
  color: 'white' | 'black';
  symbol: string;
}

const pieces: { [key: string]: string } = {
  r: '♜',
  n: '♞',
  b: '♝',
  q: '♛',
  k: '♚',
  p: '♟',
};
// Simulation des données
let mockGameState: GameState = {
  id: 'game-1',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moves: [],
  isCheck: false,
  isCheckmate: false,
  turn: 'white',
  status: 'active',
};

export interface Move {
  color: string;
  from: string;
  piece: string;
  to: string;
}

export interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

export interface GameState {
  id: string;
  fen: string;
  moves: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  turn: 'white' | 'black';
  status: 'active' | 'finished';
}

// Fonction utilitaire pour simuler un délai réseau
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Fonction pour mettre à jour le FEN après un mouvement
const updateFenAfterMove = (move: Move): string => {
  // Pour l'instant, on garde le FEN initial
  // Dans une vraie implémentation, il faudrait mettre à jour le FEN en fonction du mouvement
  return mockGameState.fen;
};

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

  // Déterminer les pièces capturées
  const capturedPieces = initialPieces.filter((piece) => !currentPieces.includes(piece));
  const capturedPiecesObj = capturedPieces.map((piece) => getPiecefromFen(piece));
  return {
    white: capturedPiecesObj.filter((piece) => piece.color === 'white'),
    black: capturedPiecesObj.filter((piece) => piece.color === 'black'),
  };
}
export const GameService = {
  async getGame(gameId: string): Promise<GameState> {
    try {
      const response = await axios.get(`${API_URL}games/${gameId}`);
      console.log('response', response);
      const game = response.data;
      const color = fenToColor(game.fen) == 'w' ? 'white' : 'black';
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
      const response = await axios.post(`${API_URL}games/${gameId}/suggestions`, {
        from,
      });
      console.log('response', response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async makeMove(gameId: string, move: Move): Promise<GameState> {
    try {
      const respose = await axios.post(`${API_URL}games/${gameId}/move`, move);
      console.log('response', respose);

      // Mise à jour du state du jeu
      mockGameState = {
        ...mockGameState,
        fen: updateFenAfterMove(move),
        moves: [...mockGameState.moves, move],
        turn: mockGameState.turn === 'white' ? 'black' : 'white',
        isCheck: Math.random() < 0.2, // 20% de chance d'être en échec
        isCheckmate: false,
      };
      console.log(mockGameState);

      return mockGameState;
    } catch (error) {
      console.error('Make move', error);
      throw error;
    }
  },

  async resign(gameId: string): Promise<void> {
    await delay(200);
    mockGameState = {
      ...mockGameState,
      status: 'finished',
    };
  },

  async offerDraw(gameId: string): Promise<void> {
    await delay(200);
    // Simule une acceptation aléatoire de la nulle
    if (Math.random() < 0.5) {
      mockGameState = {
        ...mockGameState,
        status: 'finished',
      };
    }
  },

  // Méthode utilitaire pour réinitialiser le mock state (utile pour les tests)
  resetMockState(): void {
    mockGameState = {
      id: 'game-1',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: [],
      isCheck: false,
      isCheckmate: false,
      turn: 'white',
      status: 'active',
    };
  },
};
