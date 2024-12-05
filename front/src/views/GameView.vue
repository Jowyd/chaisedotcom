<script setup lang="ts">
import { ref, computed } from 'vue';
import ChessBoard from '@/components/ChessBoard.vue';
import { GameService } from '@/services/GameService';
import { useRoute } from 'vue-router';

interface GameInfo {
  opponent: string;
  opponentRating: number;
  timeControl: string;
  timeWhite: number;
  timeBlack: number;
}

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
</script>

<template>
  <div class="game-view surface-ground">
    <div class="grid h-screen">
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

      <div class="col-12 md:col-9 p-3 w-full">
        <div class="game-container surface-section border-round shadow-1 p-3">
          <!-- Black Player Info -->
          <div class="flex justify-content-between align-items-center">
            <div
              class="player-info flex justify-content-between align-items-center p-2 border-round-md"
              :class="{ 'order-1': playerColor === 'black' }"
            >
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
            <div
              class="player-info flex justify-content-between align-items-center p-2 border-round-md active-player"
              :class="{ 'order-0': playerColor === 'black' }"
            >
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

          <!-- Chess Board avec la prop playerColor et l'événement captured-pieces -->
          <ChessBoard :player-color="playerColor" v-model:captured-pieces="capturedPieces" />

          <!-- White Player Info -->

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
      </div>

      <!-- Game Chat & Moves -->
      <!-- <div class="col-12 md:col-3 p-3">
        <TabView>
          <TabPanel header="Moves" :value="0">
            <div class="moves-list surface-section border-round p-3 h-30rem overflow-y-auto">
              <div class="flex align-items-center mb-2" v-for="n in 10" :key="n">
                <span class="text-500 mr-2">{{ n }}.</span>
                <span class="mr-2">e4</span>
                <span>e5</span>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.game-view {
  min-height: 100vh;
}

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
</style>
