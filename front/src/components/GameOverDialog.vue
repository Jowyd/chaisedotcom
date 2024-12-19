<script setup lang="ts">
import { computed, watch } from 'vue';
import type { GameState } from '@/services/GameService';
import type { CapturedPieces } from '@/types';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

interface GameInfo {
  timeControl: string;
  timeWhite: number;
  timeBlack: number;
}

interface Props {
  visible: boolean;
  gameState: GameState;
  gameInfo: GameInfo;
  capturedPieces: CapturedPieces;
  moves: any[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const gameResult = computed(() => {
  console.log('Computing game result:', props.gameState?.status);
  if (props.gameState && props.gameState.status === 'checkmate') {
    const winner = props.gameState.turn === 'white' ? 'Black' : 'White';
    return {
      title: 'Checkmate!',
      winner,
      message: `${winner} wins by checkmate`,
    };
  }
  return null;
});

watch(
  () => props.visible,
  (newValue) => {
    console.log('Dialog visibility changed:', newValue);
  },
);
</script>

<template>
  <Dialog
    v-model="dialogVisible"
    modal
    :header="gameResult?.title"
    :closable="false"
    class="game-over-dialog"
    :visible="dialogVisible"
  >
    <div class="flex flex-column align-items-center gap-4">
      <div class="text-4xl font-bold mb-2">{{ gameResult?.winner }} wins!</div>
      <div class="text-xl text-600">{{ gameResult?.message }}</div>

      <!-- Stats -->
      <div class="game-stats w-full surface-ground p-4 border-round">
        <div class="grid">
          <div class="col-6 flex flex-column align-items-center">
            <span class="text-xl font-medium mb-2">White</span>
            <div class="flex flex-column align-items-center gap-2">
              <div class="text-600">Captured pieces: {{ capturedPieces.black.length }}</div>
              <div class="text-600">Time left: {{ formatTime(gameInfo.timeWhite) }}</div>
            </div>
          </div>
          <div class="col-6 flex flex-column align-items-center">
            <span class="text-xl font-medium mb-2">Black</span>
            <div class="flex flex-column align-items-center gap-2">
              <div class="text-600">Captured pieces: {{ capturedPieces.white.length }}</div>
              <div class="text-600">Time left: {{ formatTime(gameInfo.timeBlack) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Moves summary -->
      <!-- <div class="moves-summary w-full">
        <div class="text-xl font-medium mb-2">Game summary</div>
        <div class="surface-ground p-3 border-round">
          <div class="flex justify-content-between">
            <span>Total moves: {{ moves.length }}</span>
            <span
              >Game duration:
              {{ formatTime(gameInfo.timeControl.split('+')[0] * 60 - gameInfo.timeWhite) }}</span
            >
          </div>
        </div>
      </div> -->

      <!-- Actions -->
      <div class="flex gap-2 mt-4">
        <Button label="New Game" icon="pi pi-plus" @click="$router.push('/new-game')" />
        <Button
          label="Analysis"
          icon="pi pi-chart-line"
          severity="secondary"
          @click="$router.push(`/analysis/${gameState?.id}`)"
        />
        <Button label="Back to Home" icon="pi pi-home" text @click="$router.push('/')" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.game-over-dialog {
  max-width: 500px;
}

:deep(.game-over-dialog .p-dialog-header) {
  padding-bottom: 0;
}

:deep(.game-over-dialog .p-dialog-content) {
  padding-top: 1.5rem;
}

.game-stats {
  border: 1px solid var(--surface-border);
}

.moves-summary {
  border: 1px solid var(--surface-border);
}
</style>
