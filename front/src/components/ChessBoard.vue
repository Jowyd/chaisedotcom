<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { GameService, type Move, type GameState } from '@/services/GameService';

interface ChessPiece {
  type: string;
  color: 'white' | 'black';
  symbol: string;
}

interface Position {
  row: number;
  col: number;
}

const route = useRoute();
const gameId = computed(() => route.params.id as string);

const board = ref<(ChessPiece | null)[][]>([]);
const selectedPiece = ref<Position | null>(null);
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
const validMoves = ref<Position[]>([]);
const gameState = ref<GameState | null>(null);

// Ajout d'une prop pour contrôler la couleur du joueur
const props = defineProps<{
  playerColor?: 'white' | 'black';
}>();

// Détermine si c'est le tour du joueur
const isPlayerTurn = computed(() => {
  return true;
  //   return gameState.value?.turn === (props.playerColor || 'white' );
});

// Fonction pour retourner l'échiquier selon la couleur du joueur
const boardView = computed(() => {
  const currentBoard = board.value;
  if (!currentBoard || props.playerColor !== 'black') {
    return currentBoard;
  }
  // Retourne l'échiquier pour les noirs
  return [...currentBoard].reverse().map((row) => [...row].reverse());
});

// Ajuste les coordonnées en fonction de la couleur du joueur
const adjustCoordinates = (row: number, col: number): { row: number; col: number } => {
  if (props.playerColor === 'black') {
    return {
      row: 7 - row,
      col: 7 - col,
    };
  }
  return { row, col };
};

// Convertit les coordonnées de l'échiquier en notation algébrique
const toAlgebraic = (row: number, col: number): string => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  return `${files[col]}${ranks[row]}`;
};

// Convertit la notation algébrique en coordonnées
const fromAlgebraic = (square: string): Position => {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const col = files.indexOf(square[0]);
  const row = ranks.indexOf(square[1]);
  return { row, col };
};

const initializeBoard = () => {
  const newBoard: (ChessPiece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const pieces: { [key: string]: string } = {
    r: '♜',
    n: '♞',
    b: '♝',
    q: '♛',
    k: '♚',
    p: '♟',
  };

  // Set up black pieces
  const backRankBlack = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  backRankBlack.forEach((piece, i) => {
    newBoard[0][i] = { type: piece, color: 'black', symbol: pieces[piece] };
  });
  for (let i = 0; i < 8; i++) {
    newBoard[1][i] = { type: 'p', color: 'black', symbol: pieces['p'] };
  }

  // Set up white pieces
  const backRankWhite = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  backRankWhite.forEach((piece, i) => {
    newBoard[7][i] = { type: piece, color: 'white', symbol: pieces[piece] };
  });
  for (let i = 0; i < 8; i++) {
    newBoard[6][i] = { type: 'p', color: 'white', symbol: pieces['p'] };
  }

  board.value = newBoard;
};

const getSquareColor = (row: number, col: number): string => {
  return (row + col) % 2 === 0 ? 'white' : 'black';
};

const isValidMove = (from: Position, to: Position): boolean => {
  // Ici, vous pouvez implémenter la logique de validation des mouvements
  // Pour l'instant, permettons tous les mouvements
  return true;
};

// Mise à jour de handleSquareClick pour utiliser les coordonnées ajustées
const handleSquareClick = async (displayRow: number, displayCol: number) => {
  console.log('handleSquareClick', isPlayerTurn.value, displayRow, displayCol);
  if (!isPlayerTurn.value) return;

  const { row, col } = adjustCoordinates(displayRow, displayCol);
  const piece = board.value[row][col];

  if (!selectedPiece.value) {
    if (piece && piece.color === (gameState.value?.turn || 'white')) {
      selectedPiece.value = { row, col };
    }
    validMoves.value = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'].map(fromAlgebraic);
    return;
  }

  const from = selectedPiece.value;
  const to = { row, col };

  if (isValidMove(from, to)) {
    try {
      const move: Move = {
        from: toAlgebraic(from.row, from.col),
        to: toAlgebraic(row, col),
        piece: board.value[from.row][from.col]!.type,
        color: board.value[from.row][from.col]!.color,
      };
      console.log('Making move:', move);

      const newGameState = await GameService.makeMove(gameId.value, move);

      // Déplacer la pièce sur l'échiquier
      const piece = board.value[from.row][from.col];
      board.value[row][col] = piece;
      board.value[from.row][from.col] = null;

      gameState.value = newGameState;
      console.log(newGameState);
    } catch (error) {
      console.error('Error making move:', error);
    }
  }

  selectedPiece.value = null;
  validMoves.value = [];
};

const updateBoardFromGameState = (state: GameState) => {
  gameState.value = state;
  const newBoard: (ChessPiece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const pieces: { [key: string]: string } = {
    r: '♜',
    n: '♞',
    b: '♝',
    q: '♛',
    k: '♚',
    p: '♟',
  };

  const fenBoard = state.fen.split(' ')[0];
  const rows = fenBoard.split('/');

  rows.forEach((row, rowIndex) => {
    let colIndex = 0;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (/\d/.test(char)) {
        colIndex += parseInt(char);
      } else {
        const isWhite = char === char.toUpperCase();
        const pieceType = char.toLowerCase();
        newBoard[rowIndex][colIndex] = {
          type: pieceType,
          color: isWhite ? 'white' : 'black',
          symbol: pieces[pieceType],
        };
        colIndex++;
      }
    }
  });

  board.value = newBoard;
  gameState.value = state;
};

const loadGame = async () => {
  try {
    const state = await GameService.getGame(gameId.value);
    updateBoardFromGameState(state);
  } catch (error) {
    console.error('Error loading game:', error);
  }
};

onMounted(() => {
  if (gameId.value) {
    loadGame();
  } else {
    initializeBoard();
  }
});
</script>

<template>
  <div class="chess-board-container">
    <div class="chess-board">
      <!-- Files labels (top) -->
      <div class="files-labels top">
        <div
          v-for="file in playerColor === 'black' ? [...files].reverse() : files"
          :key="`top-${file}`"
          class="label"
        >
          {{ file }}
        </div>
      </div>

      <!-- Ranks labels (left) -->
      <div class="ranks-labels left">
        <div
          v-for="rank in playerColor === 'black' ? ranks : [...ranks].reverse()"
          :key="`left-${rank}`"
          class="label"
        >
          {{ rank }}
        </div>
      </div>

      <!-- Chess board -->
      <div class="board">
        <div v-for="(row, rowIndex) in boardView" :key="`row-${rowIndex}`" class="board-row">
          <div
            v-for="(square, colIndex) in row"
            :key="`square-${rowIndex}-${colIndex}`"
            class="square"
            :class="[
              getSquareColor(
                playerColor === 'black' ? 7 - rowIndex : rowIndex,
                playerColor === 'black' ? 7 - colIndex : colIndex,
              ),
              {
                selected:
                  selectedPiece?.row === (playerColor === 'black' ? 7 - rowIndex : rowIndex) &&
                  selectedPiece?.col === (playerColor === 'black' ? 7 - colIndex : colIndex),
                'valid-move': validMoves.some(
                  (move) =>
                    move.row === (playerColor === 'black' ? 7 - rowIndex : rowIndex) &&
                    move.col === (playerColor === 'black' ? 7 - colIndex : colIndex),
                ),
              },
            ]"
            @click="handleSquareClick(rowIndex, colIndex)"
          >
            <span v-if="square" class="piece" :class="square.color">{{ square.symbol }}</span>
          </div>
        </div>
      </div>

      <!-- Ranks labels (right) -->
      <div class="ranks-labels right">
        <div
          v-for="rank in playerColor === 'black' ? ranks : [...ranks].reverse()"
          :key="`right-${rank}`"
          class="label"
        >
          {{ rank }}
        </div>
      </div>

      <!-- Files labels (bottom) -->
      <div class="files-labels bottom">
        <div
          v-for="file in playerColor === 'black' ? [...files].reverse() : files"
          :key="`bottom-${file}`"
          class="label"
        >
          {{ file }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chess-board-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.chess-board {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr auto;
  gap: 4px;
  background: var(--surface-ground);
  padding: 1rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

.board {
  display: flex;
  flex-direction: column;
  border: 2px solid var(--surface-border);
}

.board-row {
  display: flex;
}

.square {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
}

.square.white {
  background-color: #f0d9b5;
}

.square.black {
  background-color: #b58863;
}

.piece {
  cursor: pointer;
  user-select: none;
}

.piece.white {
  color: #fff;
  text-shadow: 0 0 2px #000;
}

.piece.black {
  color: #000;
  text-shadow: 0 0 2px #fff;
}

.files-labels,
.ranks-labels {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.files-labels {
  padding: 0 2rem;
}

.ranks-labels {
  flex-direction: column;
  padding: 0 0.5rem;
}

.label {
  color: var(--text-color);
  font-weight: 600;
}

@media screen and (max-width: 768px) {
  .square {
    width: 40px;
    height: 40px;
    font-size: 1.8rem;
  }
}

.square.selected {
  background-color: rgba(255, 255, 0, 0.5) !important;
}

.square.valid-move {
  position: relative;
}

.square.valid-move::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 255, 0, 0.3);
  pointer-events: none;
}

.piece {
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s ease;
}

.piece:hover {
  transform: scale(1.1);
}
</style>
