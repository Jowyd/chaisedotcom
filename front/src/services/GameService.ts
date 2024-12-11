import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

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
  from: string;
  to: string;
  promotion?: string;
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

export const GameService = {
  async getGame(gameId: string): Promise<GameState> {
    //     const response = await axios.get(`${API_URL}games/${gameId}`);
    //     console.log('response', response);
    await delay(300); // Simule la latence réseau
    return { ...mockGameState, id: gameId };
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
      console.error(error);
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
