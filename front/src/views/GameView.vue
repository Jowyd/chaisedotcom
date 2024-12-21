<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ChessBoard from '@/components/ChessBoard.vue';
import { GameService, type GameState } from '@/services/GameService';
import { useRoute } from 'vue-router';
import Badge from 'primevue/badge';
import Tag from 'primevue/tag';
import GameOverDialog from '@/components/GameOverDialog.vue';

interface GameInfo {
  opponent: string;
  opponentRating: number;
  timeControl: string;
  timeWhite: number;
  timeBlack: number;
}

interface PieceMove {
  color: string;
  from: string;
  piece: string;
  to: string;
}
const moves = ref<PieceMove[]>([]);

const filteredMoves = computed(() => {
  return moves.value.filter((_, index) => index % 2 === 0);
});

const gameInfo = ref<GameInfo>({
  opponent: 'Magnus Carlsen',
  opponentRating: 2847,
  timeControl: '5+3',
  timeWhite: 300, // 5 minutes in seconds
  timeBlack: 300,
});

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const route = useRoute();
const gameId = computed(() => route.params.id as string);

const handleResign = async () => {
  try {
    await GameService.resign(gameId.value);
    // Gérer la fin de partie
  } catch (error) {
    console.error('Error resigning game:', error);
  }
};

const handleDrawOffer = async () => {
  try {
    await GameService.offerDraw(gameId.value);
    // Afficher un message de confirmation
  } catch (error) {
    console.error('Error offering draw:', error);
  }
};

onMounted(() => {
  // Récupérer les informations de la partie
  GameService.getGame(gameId.value).then((game: GameState) => {
    updateGameState(game);
    //     gameInfo.value = game;
  });
});

// Ajout d'une ref pour la couleur du joueur
const playerColor = ref<'white' | 'black'>('white');

// Fonction pour changer la couleur du joueur
const togglePlayerColor = () => {
  playerColor.value = playerColor.value === 'white' ? 'black' : 'white';
};

interface CapturedPieces {
  white: ChessPiece[];
  black: ChessPiece[];
}

const capturedPieces = ref<CapturedPieces>({
  white: [],
  black: [],
});

const handleCapturedPiecesUpdate = (pieces: CapturedPieces) => {
  capturedPieces.value = pieces;
};
const gameState = ref<GameState | null>(null);

const currentMoveIndex = ref(-1);

const goToMove = async (index: number) => {
  try {
    const newGameState = await GameService.goToMove(gameId.value, index);
    updateGameState(newGameState);
    currentMoveIndex.value = index;
  } catch (error) {
    console.error('Error going to move:', error);
  }
};

const goToPreviousMove = () => {
  if (currentMoveIndex.value > 0) {
    goToMove(currentMoveIndex.value - 1);
  }
};

const goToNextMove = () => {
  if (currentMoveIndex.value < moves.value.length - 1) {
    goToMove(currentMoveIndex.value + 1);
  }
};

const goToCurrentPosition = () => {
  goToMove(moves.value.length - 1);
};

const updateGameState = (newState: GameState) => {
  gameState.value = newState;
  moves.value = newState.moves;
  if (currentMoveIndex.value === -1) {
    currentMoveIndex.value = moves.value.length - 1;
  }
  if (newState.status === 'checkmate') {
    showGameOverDialog.value = true;
  }
};

const getPieceSymbol = (piece: string): string => {
  const symbols: { [key: string]: string } = {
    PAWN: '♟',
    KNIGHT: '♞',
    BISHOP: '♝',
    ROOK: '♜',
    QUEEN: '♛',
    KING: '♚',
  };
  return symbols[piece] || piece;
};

const showGameOverDialog = ref(false);

watch(
  () => gameState.value?.status,
  (newStatus) => {
    console.log('Status changed:', newStatus);
    showGameOverDialog.value = newStatus === 'checkmate';
  },
  { immediate: true },
);
</script>

<template>
  <div class="game-view surface-ground">
    <div class="grid h-full">
      <!-- Game Header -->
      <div class="col-12 surface-section shadow-1 p-3">
        <div class="flex justify-content-between align-items-center">
          <Button icon="pi pi-arrow-left" text @click="$router.back()" />
          <div class="flex align-items-center gap-3">
            <span class="text-xl font-bold">Live Game</span>
            <!-- Bouton pour changer la perspective -->
            <Button
              icon="pi pi-refresh"
              text
              @click="togglePlayerColor"
              v-tooltip.bottom="'Flip board'"
            />
          </div>
          <Button icon="pi pi-cog" text />
        </div>
      </div>

      <div class="col-12 md:col-9 p-3 py-0 w-full flex">
        <div class="game-container surface-section border-round shadow-1 p-3">
          <!-- Modifiez la section des infos des joueurs -->
          <div class="flex justify-content-between gap-3">
            <!-- Black Player Info -->
            <div
              class="player-info-card surface-card p-3 border-round"
              :class="{
                'active-player': gameState?.turn === 'black',
                'order-1': playerColor === 'black',
              }"
            >
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-3">
                  <Avatar icon="pi pi-user" size="large" />
                  <div>
                    <div class="text-xl font-bold">{{ gameInfo.opponent }}</div>
                    <div class="text-500">Rating: {{ gameInfo.opponentRating }}</div>
                  </div>
                </div>
                <div class="time-display text-3xl font-bold">
                  {{ formatTime(gameInfo.timeBlack) }}
                </div>
              </div>
            </div>

            <!-- White Player Info -->
            <div
              class="player-info-card surface-card p-3 border-round"
              :class="{
                'active-player': gameState?.turn === 'white',
                'order-0': playerColor === 'black',
              }"
            >
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-3">
                  <Avatar icon="pi pi-user" size="large" />
                  <div>
                    <div class="text-xl font-bold">You</div>
                    <div class="text-500">Rating: 1500</div>
                  </div>
                </div>
                <div class="time-display text-3xl font-bold">
                  {{ formatTime(gameInfo.timeWhite) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Chess Board avec la prop playerColor et l'événement captured-pieces -->
          <ChessBoard
            v-if="gameState"
            :player-color="playerColor"
            v-model:captured-pieces="capturedPieces"
            v-model:gameState="gameState"
          />

          <!-- Game Controls -->
          <div class="game-controls flex justify-content-center gap-3 mt-4">
            <Button icon="pi pi-flag" severity="danger" text label="Resign" @click="handleResign" />
            <Button
              icon="pi pi-refresh"
              severity="secondary"
              text
              label="Draw Offer"
              @click="handleDrawOffer"
            />
          </div>
        </div>
        <div class="col-12 md:col-3 p-3 m-auto">
          <TabView>
            <TabPanel header="Moves" :value="0">
              <div class="moves-container">
                <!-- Contrôles de navigation -->
                <div
                  class="move-controls flex justify-content-center gap-2 p-2 surface-section border-bottom-1"
                >
                  <Button
                    icon="pi pi-step-backward"
                    text
                    rounded
                    size="small"
                    @click="goToMove(0)"
                    :disabled="currentMoveIndex === 0"
                    v-tooltip.bottom="'Go to start'"
                  />
                  <Button
                    icon="pi pi-chevron-left"
                    text
                    rounded
                    size="small"
                    @click="goToPreviousMove"
                    :disabled="currentMoveIndex === 0"
                    v-tooltip.bottom="'Previous move'"
                  />
                  <Button
                    icon="pi pi-chevron-right"
                    text
                    rounded
                    size="small"
                    @click="goToNextMove"
                    :disabled="currentMoveIndex === moves.length - 1"
                    v-tooltip.bottom="'Next move'"
                  />
                  <Button
                    icon="pi pi-step-forward"
                    text
                    rounded
                    size="small"
                    @click="goToCurrentPosition"
                    :disabled="currentMoveIndex === moves.length - 1"
                    v-tooltip.bottom="'Go to current position'"
                  />
                </div>
                <div class="moves-list">
                  <div
                    v-for="(move, index) in filteredMoves"
                    :key="index"
                    class="move-pair flex align-items-center p-2 border-bottom-1 surface-ground"
                    :class="{
                      'current-pair':
                        currentMoveIndex === index * 2 || currentMoveIndex === index * 2 + 1,
                    }"
                  >
                    <span class="move-number text-600 font-medium mr-2"> {{ index + 1 }}. </span>
                    <!-- Coup blanc -->
                    <div
                      class="move-item flex-1 cursor-pointer px-3 py-2 border-round-sm"
                      :class="{
                        'current-move': index * 2 === currentMoveIndex,
                        'hover:surface-hover': index * 2 !== currentMoveIndex,
                      }"
                      @click="goToMove(index * 2)"
                    >
                      <div class="flex align-items-center justify-content-between">
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-white" style="font-size: 0.5rem" />
                          <span class="font-medium">{{ move.from }}-{{ move.to }}</span>
                        </div>
                        <span class="piece-symbol text-600">{{ getPieceSymbol(move.piece) }}</span>
                      </div>
                    </div>

                    <!-- Coup noir (s'il existe) -->
                    <div
                      v-if="moves[index * 2 + 1]"
                      class="move-item flex-1 cursor-pointer px-3 py-2 border-round-sm ml-2"
                      :class="{
                        'current-move': index * 2 + 1 === currentMoveIndex,
                        'hover:surface-hover': index * 2 + 1 !== currentMoveIndex,
                      }"
                      @click="goToMove(index * 2 + 1)"
                    >
                      <div class="flex align-items-center justify-content-between">
                        <div class="flex align-items-center gap-2">
                          <i class="pi pi-circle-fill text-900" style="font-size: 0.5rem" />
                          <span class="font-medium"
                            >{{ moves[index * 2 + 1].from }}-{{ moves[index * 2 + 1].to }}</span
                          >
                        </div>
                        <span class="piece-symbol text-600">{{
                          getPieceSymbol(moves[index * 2 + 1].piece)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>

      <!-- Game Chat & Moves -->
    </div>
  </div>
  <GameOverDialog
    v-model:visible="showGameOverDialog"
    :game-state="gameState"
    :game-info="gameInfo"
    :captured-pieces="capturedPieces"
    :moves="moves"
  />
</template>

<style scoped>
.game-container {
  max-width: 900px;
  margin: 0 auto;
}

.time-display {
  background: var(--surface-ground);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
}

:deep(.p-tabview-panels) {
  padding: 0;
}

.order-0 {
  order: 0;
}

.order-1 {
  order: 1;
}

.active-player {
  border: 2px solid white;
}

.moves-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface-card);
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-border);
}

.move-controls {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}

.moves-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 0.5rem;
}

.move-pair {
  border-color: var(--surface-border);
  transition: background-color 0.2s;
}

.current-pair {
  background: var(--surface-card) !important;
  border: 1px solid var(--primary-200);
  margin: 0.25rem 0;
  border-radius: var(--border-radius);
}

.move-item {
  transition: all 0.2s;
  background: var(--surface-section);
  border: 1px solid transparent;
}

.move-item:hover:not(.current-move) {
  border-color: var(--primary-200);
  transform: translateX(2px);
}

.current-move {
  background: var(--primary-color);
  color: var(--primary-color-text);
  border: 1px solid var(--primary-color);
  box-shadow: var(--card-shadow);
  transform: translateX(2px);
}

.current-move .piece-type,
.current-move .pi {
  color: var(--primary-color-text) !important;
}

.piece-type {
  font-size: 0.875rem;
  font-weight: 600;
}

.move-number {
  min-width: 2rem;
  text-align: center;
}

/* Ajustez ces styles pour le TabView */
:deep(.p-tabview-panels) {
  padding: 0 !important;
  height: calc(100vh - 25rem);
}

:deep(.p-tabview-panel) {
  height: 100%;
}

:deep(.p-tabview) {
  height: 100%;
}

/* Style de la scrollbar */
.moves-list::-webkit-scrollbar {
  width: 8px;
}

.moves-list::-webkit-scrollbar-track {
  background: var(--surface-ground);
  border-radius: 4px;
}

.moves-list::-webkit-scrollbar-thumb {
  background: var(--surface-border);
  border-radius: 4px;
}

.moves-list::-webkit-scrollbar-thumb:hover {
  background: var(--surface-500);
}

/* Ajoutez ces styles */
.piece-symbol {
  font-size: 1.5rem;
  line-height: 1;
}

.current-move .piece-symbol {
  color: var(--primary-color-text) !important;
}

.player-info-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.player-info-card.active-player {
  border-color: var(--primary-color);
  box-shadow: var(--card-shadow);
}

.player-info-card.active-player::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background-color: var(--primary-color);
}

.time-display {
  background: var(--surface-hover);
  padding: 0.5rem 1.5rem;
  border-radius: var(--border-radius);
  transition: background-color 0.3s ease;
}

.active-player .time-display {
  background: var(--primary-100);
  color: var(--primary-700);
}

.order-0 {
  order: 0;
}

.order-1 {
  order: 1;
}

/* Animation pour le changement de tour */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.active-player {
  animation: pulse 1s ease-in-out;
}
</style>
