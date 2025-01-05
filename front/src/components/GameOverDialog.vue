<script setup lang="ts">
import { computed } from 'vue';
import { stillPlaying, type GameState } from '@/services/GameService';
import type { CapturedPieces, PieceMove } from '@/types';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

interface Props {
  visible: boolean;
  gameState: GameState;
  capturedPieces: CapturedPieces;
  moves: PieceMove[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  replay: [];
  close: [];
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

function getPlayerUsername() {
  if (props.gameState.turn === 'BLACK') {
    return props.gameState.blackPlayer?.username;
  } else {
    return props.gameState.whitePlayer?.username;
  }
}

const gameResult = computed(() => {
  if (props.gameState && !stillPlaying(props.gameState.status)) {
    const winner = props.gameState.moves[props.gameState.moves.length - 1].color;
    return {
      title: 'Game Over',
      winner,
      message: `${getPlayerUsername()} (${winner}) wins by ${props.gameState.status}`,
      closeable: true,
    };
  }
  return null;
});
</script>

<template>
  <Dialog
    v-model="dialogVisible"
    modal
    :header="gameResult?.title"
    :closable="true"
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
            </div>
          </div>
          <div class="col-6 flex flex-column align-items-center">
            <span class="text-xl font-medium mb-2">Black</span>
            <div class="flex flex-column align-items-center gap-2">
              <div class="text-600">Captured pieces: {{ capturedPieces.white.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Moves summary -->
      <div class="moves-summary justify-content-center surface-ground p-4 border-round">
        <div class="text-xl font-medium mb-2">Game summary</div>
        <div class="surface-ground p-3 border-round">
          <div class="flex justify-content-between">
            <span>Total moves: {{ moves.length }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 mt-4">
        <Button label="Replay" icon="pi pi-replay" severity="secondary" @click="$emit('replay')" />
        <Button
          label="Back to Home"
          icon="pi pi-home"
          text
          @click="
            $emit('close');
            $router.push('/dashboard');
          "
        />
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
