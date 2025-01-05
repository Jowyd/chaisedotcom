<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import ChessBoard from '@/components/ChessBoard.vue';
import { GameService, stillPlaying, type GameState } from '@/services/GameService';
import { useRoute } from 'vue-router';
import GameOverDialog from '@/components/GameOverDialog.vue';
import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import { type CapturedPieces, type ChessColor, type PieceMove } from '@/types';
import router from '@/router';
import Checkbox from 'primevue/checkbox';
import { type GameStatus } from '@/types';
import { useToast } from 'primevue';

const moves = ref<PieceMove[]>([]);
const isReplaying = ref(false);
const toast = useToast();

const filteredMoves = computed(() => {
  return moves.value.filter((_, index) => index % 2 === 0);
});

const route = useRoute();
const gameId = computed(() => route.params.id as string);

const confirm = useConfirm();

const handleResign = () => {
  const currentColor = gameState.value?.turn;
  if (!currentColor) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Invalid game state',
    });
  }
  confirm.require({
    message: `Are you sure you want to resign as ${currentColor}?`,
    header: 'Confirm Resignation',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const newGameState = await GameService.resign(gameId.value, currentColor!);
        updateGameState(newGameState);
      } catch (error) {
        console.info(error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to resign',
        });
      }
    },
  });
};

onMounted(() => {
  GameService.getGame(gameId.value)
    .then((game: GameState) => {
      updateGameState(game);
    })
    .catch((error) => {
      console.error('Error fetching game:', error);
      router.push('/dashboard');
    });
});

const playerColor = ref<ChessColor>('WHITE');

const togglePlayerColor = () => {
  playerColor.value = playerColor.value === 'WHITE' ? 'BLACK' : 'WHITE';
};

const capturedPieces = ref<CapturedPieces>({
  white: [],
  black: [],
});

const gameState = ref<GameState>();

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
  if (currentMoveIndex.value < moves.value.length) {
    goToMove(currentMoveIndex.value + 1);
  }
};

const goToCurrentPosition = () => {
  goToMove(moves.value.length);
};

function canGameOverDialog(newGameStatus: GameStatus): boolean {
  return !stillPlaying(newGameStatus) && !isReplaying.value && !showGameOverDialog.value;
}

const autoRotate = ref(false);

const updateGameState = (newState: GameState) => {
  if (canGameOverDialog(newState.status)) {
    showGameOverDialog.value = true;
  }
  isReplaying.value = !stillPlaying(newState.status);
  gameState.value = newState;
  moves.value = newState.moves;
  if (currentMoveIndex.value === -1) {
    currentMoveIndex.value = newState.moves.length;
  }
};

watch(
  () => gameState.value?.turn,
  (newTurn) => {
    if (!newTurn) {
      return;
    }
    if (autoRotate.value && newTurn) {
      playerColor.value = newTurn;
    }
  },
);

watch(
  () => gameState.value,
  (newGameState) => {
    if (newGameState) {
      updateGameState(newGameState);
    }
  },
);

watch(
  () => autoRotate.value,
  (autoRotateNew) => {
    if (autoRotateNew) {
      playerColor.value = gameState.value?.turn || 'WHITE';
    }
  },
);

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

const showDrawConfirmDialog = ref(false);
const drawOfferingPlayer = ref<ChessColor | null>(null);

const handleDrawOffer = () => {
  if (!gameState.value) {
    throw new Error('Invalid game state');
  }
  const currentColor = gameState.value.turn;
  drawOfferingPlayer.value = currentColor;
  showDrawConfirmDialog.value = true;
};

const handleDrawResponse = async (accept: boolean) => {
  try {
    if (accept) {
      const newGameState = await GameService.acceptDraw(gameId.value);
      updateGameState(newGameState);
    }
  } catch (error) {
    console.info('Error handling draw response:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to handle draw response',
    });
  } finally {
    showDrawConfirmDialog.value = false;
    drawOfferingPlayer.value = null;
  }
};

const handleReplay = () => {
  goToMove(0);
  showGameOverDialog.value = false;
};

const movesList = ref<HTMLElement | null>(null);

// Watch for changes in moves and scroll to the bottom
watch(moves, async () => {
  await nextTick(); // Wait for DOM updates
  if (movesList.value) {
    movesList.value.scrollTop = movesList.value.scrollHeight; // Scroll to bottom
  }
});
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
            <div class="flex align-items-center gap-2">
              <Button
                icon="pi pi-refresh"
                text
                @click="togglePlayerColor"
                v-tooltip.bottom="'Flip board manually'"
                :disabled="autoRotate"
              />
              <div class="flex align-items-center gap-2">
                <Checkbox v-model="autoRotate" :binary="true" inputId="autoRotate" />
                <label for="autoRotate" class="text-sm">Auto-rotate board</label>
              </div>
            </div>
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
                'active-player': gameState?.turn === 'BLACK',
                'order-1': playerColor === 'BLACK',
              }"
            >
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-3">
                  <Avatar
                    icon="pi pi-user"
                    size="large"
                    :label="gameState?.blackPlayer?.username.slice(0, 2)"
                    style="background-color: black; color: white"
                  />
                  <div>
                    <div class="text-xl font-bold">{{ gameState?.blackPlayer?.username }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- White Player Info -->
            <div
              class="player-info-card surface-card p-3 border-round"
              :class="{
                'active-player': gameState?.turn === 'WHITE',
                'order-0': playerColor === 'BLACK',
              }"
            >
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-3">
                  <Avatar
                    icon="pi pi-user"
                    size="large"
                    :label="gameState?.whitePlayer?.username.slice(0, 2)"
                    style="background-color: white; color: black"
                  />
                  <div>
                    <div class="text-xl font-bold">{{ gameState?.whitePlayer?.username }}</div>
                  </div>
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
          <div v-if="!isReplaying" class="game-controls flex justify-content-center gap-3 mt-4">
            <Button
              icon="pi pi-flag"
              severity="danger"
              text
              :label="`${gameState?.turn === 'WHITE' ? 'White' : 'Black'} resigns`"
              @click="handleResign"
            />
            <Button
              icon="pi pi-handshake"
              severity="secondary"
              text
              :label="`${gameState?.turn === 'WHITE' ? 'White' : 'Black'} offers draw`"
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
                    :disabled="currentMoveIndex <= 0"
                    v-tooltip.bottom="'Go to start'"
                  />
                  <Button
                    icon="pi pi-chevron-left"
                    text
                    rounded
                    size="small"
                    @click="goToPreviousMove"
                    :disabled="currentMoveIndex <= 0"
                    v-tooltip.bottom="'Previous move'"
                  />
                  <Button
                    icon="pi pi-chevron-right"
                    text
                    rounded
                    size="small"
                    @click="goToNextMove"
                    :disabled="currentMoveIndex === moves.length"
                    v-tooltip.bottom="'Next move'"
                  />
                  <Button
                    icon="pi pi-step-forward"
                    text
                    rounded
                    size="small"
                    @click="goToCurrentPosition"
                    :disabled="currentMoveIndex === moves.length"
                    v-tooltip.bottom="'Go to current position'"
                  />
                </div>
                <div class="moves-list" ref="movesList">
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
                      <div class="flex align-items-center justify-content-start gap-2">
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
    :game-state="gameState!"
    :captured-pieces="capturedPieces"
    :moves="moves"
    @replay="handleReplay"
    @close="showGameOverDialog = false"
  />
  <ConfirmDialog />
  <Dialog
    v-model:visible="showDrawConfirmDialog"
    modal
    :header="`Draw Offer - ${drawOfferingPlayer?.toUpperCase()} Player`"
    :style="{ width: '400px' }"
    :closable="false"
    :draggable="false"
  >
    <div class="flex flex-column align-items-center gap-4">
      <i class="pi pi-handshake text-6xl text-primary"></i>
      <div class="text-2xl font-bold">{{ drawOfferingPlayer?.toUpperCase() }} offers a draw</div>
      <div class="text-xl text-600">
        <strong>{{ drawOfferingPlayer === 'WHITE' ? 'Black' : 'White' }}</strong
        >, do you accept?
      </div>
    </div>

    <template #footer>
      <div class="flex w-full justify-content-center gap-3">
        <Button
          label="Accept"
          icon="pi pi-check"
          @click="handleDrawResponse(true)"
          severity="success"
          text
        />
        <Button
          label="Decline"
          icon="pi pi-times"
          @click="handleDrawResponse(false)"
          severity="danger"
          text
        />
      </div>
    </template>
  </Dialog>
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
  width: 100%;
}

.player-info-card.active-player {
  border-color: var(--primary-color);
  box-shadow: 0 0 15px rgba(var(--primary-color-rgb), 0.2);
  background: linear-gradient(to right, var(--primary-50) 0%, var(--surface-card) 100%);
}

.player-info-card.active-player::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background-color: var(--primary-color);
  animation: pulseBar 2s infinite;
}

.player-info-card.active-player::after {
  content: '►';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-color);
  font-size: 1.2rem;
}

@keyframes pulseBar {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

/* Remplacer l'animation pulse existante par celle-ci */
@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.4);
  }
  70% {
    transform: scale(1.01);
    box-shadow: 0 0 0 10px rgba(var(--primary-color-rgb), 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0);
  }
}

.active-player {
  animation: pulse 2s infinite;
}

.draw-offer {
  background: var(--surface-hover);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
}

:deep(.p-dialog-content) {
  padding: 2rem;
}

:deep(.p-dialog-footer) {
  padding: 1rem 2rem 2rem 2rem;
  border-top: none;
}

.flex.align-items-center label {
  margin: 0;
  cursor: pointer;
}

:deep(.p-checkbox) {
  width: 1.25rem;
  height: 1.25rem;
}

/* Ajoutez ces styles pour une meilleure transition */
.chess-board {
  transition: transform 0.3s ease-in-out;
}

/* Style pour le checkbox désactivé */
:deep(.p-checkbox.p-disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Style pour le label du checkbox */
.flex.align-items-center label {
  margin: 0;
  cursor: pointer;
}

:deep(.p-checkbox) {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
