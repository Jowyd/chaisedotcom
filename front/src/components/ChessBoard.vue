<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  GameService,
  type Move,
  type GameState,
  type CapturedPieces,
} from '@/services/GameService';

interface ChessPiece {
  type: string;
  color: 'white' | 'black';
  symbol: string;
}

interface Position {
  row: number;
  col: number;
}

interface PromotionData {
  from: Position;
  to: Position;
  isOpen: boolean;
}

const route = useRoute();
const gameId = computed(() => route.params.id as string);

const board = ref<(ChessPiece | null)[][]>([]);
const selectedPiece = ref<Position | null>(null);
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
const validMoves = ref<Position[]>([]);
const gameState = ref<GameState | null>(null);
const capturedPieces = ref<CapturedPieces>({
  white: [],
  black: [],
});

const promotionDialog = ref<PromotionData>({
  from: { row: 0, col: 0 },
  to: { row: 0, col: 0 },
  isOpen: false,
});

interface PromotionPiece {
  type: string;
  symbol: string;
}

const promotionPieces: { [key: string]: PromotionPiece[] } = {
  white: [
    { type: 'q', symbol: '♛' },
    { type: 'r', symbol: '♜' },
    { type: 'b', symbol: '♝' },
    { type: 'n', symbol: '♞' },
  ],
  black: [
    { type: 'q', symbol: '♛' },
    { type: 'r', symbol: '♜' },
    { type: 'b', symbol: '♝' },
    { type: 'n', symbol: '♞' },
  ],
};

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
  console.log('handleSquareClick', isPlayerTurn.value, displayRow, displayCol, selectedPiece.value);
  const { row, col } = adjustCoordinates(displayRow, displayCol);
  const piece = board.value[row][col];
  if (!selectedPiece.value && piece?.color != gameState.value?.turn) return;

  if (selectedPiece.value && selectedPiece.value.row === row && selectedPiece.value.col === col) {
    selectedPiece.value = null;
    validMoves.value = [];
    return;
  }

  if (!selectedPiece.value) {
    if (piece && piece.color === gameState.value?.turn) {
      selectedPiece.value = { row, col };
    }
    const from: string = toAlgebraic(row, col);
    GameService.getSuggestions(gameId.value, from).then((suggestions: string[]) => {
      validMoves.value = suggestions.map(fromAlgebraic);
    });

    return;
  }

  const from = selectedPiece.value;
  const to = { row, col };

  if (isValidMove(from, to)) {
    try {
      const move: Move = {
        from: toAlgebraic(from.row, from.col),
        to: toAlgebraic(row, col),
      };
      const newGameState = await GameService.makeMove(gameId.value, move);
      // Si une pièce est présente sur la case cible, elle est capturée
      const capturedPiece = board.value[row][col];
      if (capturedPiece) {
        const captureColor = capturedPiece.color === 'white' ? 'white' : 'black';
        capturedPieces.value[captureColor].push(capturedPiece);
      }

      console.log('Making move:', move);

      // Déplacer la pièce sur l'échiquier

      const currentPiece = board.value[row][col];
      console.log('currentPiece', currentPiece);
      const isPromotion =
        currentPiece?.type === 'p' &&
        ((currentPiece.color === 'white' && to.row === 0) ||
          (currentPiece.color === 'black' && to.row === 7));

      if (isPromotion) {
        promotionDialog.value = {
          from,
          to,
          isOpen: true,
        };
      } else {
        console.log('MAke move');
        gameState.value = newGameState;
      }
      selectedPiece.value = null;
      return;
    } catch (error) {
      console.error('Error making move:', error);
    } finally {
      const piece = board.value[from.row][from.col];
      board.value[row][col] = piece;
      board.value[from.row][from.col] = null;
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
  capturedPieces.value = GameService.getCapturedPieces(fenBoard);
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

// Fonction pour calculer la valeur matérielle
const calculateMaterialValue = (pieces: ChessPiece[]): number => {
  const values: { [key: string]: number } = {
    p: 1, // pion
    n: 3, // cavalier
    b: 3, // fou
    r: 5, // tour
    q: 9, // dame
    k: 0, // roi (pas compté dans l'avantage matériel)
  };

  return pieces.reduce((sum, piece) => sum + (values[piece.type] || 0), 0);
};

// Compute l'avantage matériel
const materialAdvantage = computed(() => {
  const whiteValue = calculateMaterialValue(capturedPieces.value.black); // pièces noires capturées
  const blackValue = calculateMaterialValue(capturedPieces.value.white); // pièces blanches capturées
  return whiteValue - blackValue;
});

// Émet les pièces capturées pour le composant parent
const emit = defineEmits<{
  'update:capturedPieces': [pieces: CapturedPieces];
}>();

watch(capturedPieces, (newValue) => {
  emit('update:capturedPieces', newValue);
});

const handlePromotion = async (promotionPiece: PromotionPiece) => {
  try {
    const { from, to } = promotionDialog.value;
    const move: Move = {
      from: toAlgebraic(from.row, from.col),
      to: toAlgebraic(to.row, to.col),
      promotion: promotionPiece.type,
    };

    const newGameState = await GameService.makeMove(gameId.value, move);
    console.log('Promotion move:', move, newGameState);

    // Mettre à jour l'état du jeu
    const newPiece: ChessPiece = {
      type: promotionPiece.type,
      color: gameState?.value?.turn === 'white' ? 'white' : 'black',
      symbol: promotionPiece.symbol,
    };
    board.value[to.row][to.col] = newPiece;
    gameState.value = newGameState;
    //     updateBoardFromGameState(newGameState);

    // Fermer le dialog
    promotionDialog.value.isOpen = false;
  } catch (error) {
    console.error('Error making promotion move:', error);
  }
};
</script>

<template>
  <div class="chess-board-container m-auto">
    <!-- Pièces capturées par les blancs -->
    <div class="captured-pieces white mb-2">
      <div class="captured-pieces-header">
        <span class="font-medium">Captured pieces</span>
        <span v-if="materialAdvantage > 0" class="material-advantage">
          +{{ materialAdvantage }}
        </span>
      </div>
      <div class="pieces-list">
        <span
          v-for="(piece, index) in capturedPieces.black"
          :key="`white-captured-${index}`"
          class="captured-piece"
        >
          {{ piece.symbol }}
        </span>
      </div>
    </div>

    <!-- Échiquier existant -->
    <div class="chess-board">
      <!-- Files labels (top) -->

      <!-- Ranks labels (left) -->
      <div class="left">
        <div class="square"></div>
        <div
          v-for="rank in playerColor === 'black' ? ranks : [...ranks].reverse()"
          :key="`left-${rank}`"
          class="label square text-base"
        >
          {{ rank }}
        </div>
      </div>

      <div class="flex flex-column">
        <div class="top flex">
          <div
            v-for="file in playerColor === 'black' ? [...files].reverse() : files"
            :key="`top-${file}`"
            class="label square text-base"
          >
            {{ file }}
          </div>
        </div>
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
      </div>
      <!-- Chess board -->
    </div>

    <!-- Pièces capturées par les noirs -->
    <div class="captured-pieces black mt-2">
      <div class="captured-pieces-header">
        <span class="font-medium">Captured pieces</span>
        <span v-if="materialAdvantage < 0" class="material-advantage">
          {{ materialAdvantage }}
        </span>
      </div>
      <div class="pieces-list">
        <span
          v-for="(piece, index) in capturedPieces.white"
          :key="`black-captured-${index}`"
          class="captured-piece"
        >
          {{ piece.symbol }}
        </span>
      </div>
    </div>

    <!-- Dialog de promotion -->
    <div v-if="promotionDialog.isOpen" class="promotion-dialog">
      <div class="promotion-dialog-content">
        <h3 class="promotion-title">Choose promotion piece</h3>
        <div class="promotion-pieces">
          <button
            v-for="piece in promotionPieces[gameState!.turn]"
            :key="piece.type"
            class="promotion-piece"
            @click="handlePromotion(piece)"
          >
            <span :class="gameState?.turn">{{ piece.symbol }}</span>
          </button>
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
  font-size: 3.5rem;
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

.captured-pieces {
  width: 100%;
  padding: 0.5rem;
  background: var(--surface-section);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.captured-pieces-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.material-advantage {
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius);
  background: var(--surface-ground);
}

.pieces-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  min-height: 2rem;
}

.captured-piece {
  font-size: 1.5rem;
  line-height: 1;
}

.captured-pieces.white .captured-piece {
  color: #000;
  text-shadow: 0 0 2px #fff;
}

.captured-pieces.black .captured-piece {
  color: #fff;
  text-shadow: 0 0 2px #000;
}

.promotion-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.promotion-dialog-content {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.promotion-title {
  text-align: center;
  margin-bottom: 1rem;
  color: var(--text-color);
}

.promotion-pieces {
  display: flex;
  gap: 1rem;
}

.promotion-piece {
  width: 60px;
  height: 60px;
  font-size: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: transform 0.2s;
}

.promotion-piece:hover {
  transform: scale(1.1);
  background: var(--surface-hover);
}

.promotion-piece span {
  user-select: none;
}

.promotion-piece span.white {
  color: #fff;
  text-shadow: 0 0 2px #000;
}

.promotion-piece span.black {
  color: #000;
  text-shadow: 0 0 2px #fff;
}
</style>
