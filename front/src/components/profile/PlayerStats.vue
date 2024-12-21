<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  username: string;
}>();

const stats = ref({
  rating: 1500,
  gamesPlayed: {
    total: 0,
    asWhite: 0,
    asBlack: 0,
  },
  results: {
    wins: {
      total: 0,
      asWhite: 0,
      asBlack: 0,
    },
    losses: {
      total: 0,
      asWhite: 0,
      asBlack: 0,
    },
    draws: {
      total: 0,
      asWhite: 0,
      asBlack: 0,
    },
  },
  averages: {
    movesPerGame: 0,
    gameLength: '00:00',
    capturedPieces: 0,
  },
  bestWinStreak: 0,
  currentStreak: 0,
});

onMounted(async () => {
  // Simuler le chargement des statistiques
  stats.value = {
    rating: 1500,
    gamesPlayed: {
      total: 50,
      asWhite: 26,
      asBlack: 24,
    },
    results: {
      wins: {
        total: 25,
        asWhite: 15,
        asBlack: 10,
      },
      losses: {
        total: 20,
        asWhite: 9,
        asBlack: 11,
      },
      draws: {
        total: 5,
        asWhite: 2,
        asBlack: 3,
      },
    },
    averages: {
      movesPerGame: 35,
      gameLength: '15:30',
      capturedPieces: 8,
    },
    bestWinStreak: 5,
    currentStreak: 2,
  };
});

const calculateWinRate = (color?: 'white' | 'black') => {
  if (!color) {
    return ((stats.value.results.wins.total / stats.value.gamesPlayed.total) * 100).toFixed(1);
  }
  const gamesAsColor = color === 'white' ? stats.value.gamesPlayed.asWhite : stats.value.gamesPlayed.asBlack;
  const winsAsColor = color === 'white' ? stats.value.results.wins.asWhite : stats.value.results.wins.asBlack;
  return ((winsAsColor / gamesAsColor) * 100).toFixed(1);
};
</script>

<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4">Player Statistics</h2>
    
    <div class="grid">
      <!-- Rating -->
      <div class="col-12 mb-4">
        <div class="text-center">
          <div class="text-4xl font-bold text-primary">{{ stats.rating }}</div>
          <div class="text-600">Rating</div>
        </div>
      </div>

      <!-- Stats généraux -->
      <div class="col-12">
        <div class="surface-ground p-3 border-round mb-4">
          <h3 class="text-lg font-medium mt-0 mb-3">Overall Performance</h3>
          <div class="grid">
            <div class="col-4 text-center">
              <div class="text-2xl font-bold">{{ stats.gamesPlayed.total }}</div>
              <div class="text-600">Games</div>
            </div>
            <div class="col-4 text-center">
              <div class="text-2xl font-bold text-green-500">{{ stats.results.wins.total }}</div>
              <div class="text-600">Wins</div>
            </div>
            <div class="col-4 text-center">
              <div class="text-2xl font-bold">{{ calculateWinRate() }}%</div>
              <div class="text-600">Win Rate</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats par couleur -->
      <div class="col-12 lg:col-6">
        <div class="surface-ground p-3 border-round h-full">
          <h3 class="text-lg font-medium mt-0 mb-3">As White</h3>
          <div class="flex flex-column gap-2">
            <div class="flex justify-content-between">
              <span class="text-600">Games Played</span>
              <span class="font-medium">{{ stats.gamesPlayed.asWhite }}</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-600">Win Rate</span>
              <span class="font-medium">{{ calculateWinRate('white') }}%</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-600">Wins/Losses/Draws</span>
              <span class="font-medium">
                {{ stats.results.wins.asWhite }}/{{ stats.results.losses.asWhite }}/{{
                  stats.results.draws.asWhite
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 lg:col-6">
        <div class="surface-ground p-3 border-round h-full">
          <h3 class="text-lg font-medium mt-0 mb-3">As Black</h3>
          <div class="flex flex-column gap-2">
            <div class="flex justify-content-between">
              <span class="text-600">Games Played</span>
              <span class="font-medium">{{ stats.gamesPlayed.asBlack }}</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-600">Win Rate</span>
              <span class="font-medium">{{ calculateWinRate('black') }}%</span>
            </div>
            <div class="flex justify-content-between">
              <span class="text-600">Wins/Losses/Draws</span>
              <span class="font-medium">
                {{ stats.results.wins.asBlack }}/{{ stats.results.losses.asBlack }}/{{
                  stats.results.draws.asBlack
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Moyennes -->
      <div class="col-12 mt-4">
        <div class="surface-ground p-3 border-round">
          <h3 class="text-lg font-medium mt-0 mb-3">Averages</h3>
          <div class="grid">
            <div class="col-4">
              <div class="text-center">
                <div class="text-xl font-bold">{{ stats.averages.movesPerGame }}</div>
                <div class="text-600">Moves/Game</div>
              </div>
            </div>
            <div class="col-4">
              <div class="text-center">
                <div class="text-xl font-bold">{{ stats.averages.gameLength }}</div>
                <div class="text-600">Game Length</div>
              </div>
            </div>
            <div class="col-4">
              <div class="text-center">
                <div class="text-xl font-bold">{{ stats.averages.capturedPieces }}</div>
                <div class="text-600">Captures/Game</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Streaks -->
      <div class="col-12 mt-4">
        <div class="surface-ground p-3 border-round">
          <div class="flex justify-content-between">
            <div>
              <div class="text-600">Best Win Streak</div>
              <div class="text-xl font-bold">{{ stats.bestWinStreak }} games</div>
            </div>
            <div class="text-right">
              <div class="text-600">Current Streak</div>
              <div class="text-xl font-bold">{{ stats.currentStreak }} games</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}
</style> 