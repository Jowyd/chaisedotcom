<script setup lang="ts">
import type { UserStats } from '@/types';

interface PlayerStatsProps {
  username: string;
  stats: UserStats;
}

const props = defineProps<PlayerStatsProps>();

const calculateWinRate = (color?: 'white' | 'black') => {
  if (!color) {
    return ((props.stats.results.wins.total / props.stats.gamesPlayed.total) * 100).toFixed(1);
  }
  const gamesAsColor =
    color === 'white' ? props.stats.gamesPlayed.asWhite : props.stats.gamesPlayed.asBlack;
  const winsAsColor =
    color === 'white' ? props.stats.results.wins.asWhite : props.stats.results.wins.asBlack;
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
          <div class="text-4xl font-bold text-primary">{{ props.stats.rating }}</div>
          <div class="text-600">Rating</div>
        </div>
      </div>

      <!-- Stats généraux -->
      <div class="col-12">
        <div class="grid">
          <!-- Games Played -->
          <div class="col-12 md:col-6 mb-3">
            <div class="text-center p-3 border-round bg-primary-50">
              <div class="text-2xl font-semibold">{{ props.stats.gamesPlayed.total }}</div>
              <div>Games Played</div>
            </div>
          </div>

          <!-- Win Rate -->
          <div class="col-12 md:col-6 mb-3">
            <div class="text-center p-3 border-round bg-primary-50">
              <div class="text-2xl font-semibold">{{ calculateWinRate() }}%</div>
              <div>Win Rate</div>
            </div>
          </div>

          <!-- Best Streak -->
          <div class="col-12 md:col-6 mb-3">
            <div class="text-center p-3 border-round bg-primary-50">
              <div class="text-2xl font-semibold">{{ props.stats.bestWinStreak }}</div>
              <div>Best Win Streak</div>
            </div>
          </div>

          <!-- Current Streak -->
          <div class="col-12 md:col-6 mb-3">
            <div class="text-center p-3 border-round bg-primary-50">
              <div class="text-2xl font-semibold">{{ props.stats.currentStreak }}</div>
              <div>Current Streak</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Stats -->
      <div class="col-12">
        <h3 class="text-xl font-semibold mb-3">Detailed Statistics</h3>

        <!-- Color Distribution -->
        <div class="mb-4">
          <h4 class="text-lg mb-2">Games by Color</h4>
          <div class="grid">
            <div class="col-6">
              <div class="flex align-items-center justify-content-between">
                <span>White</span>
                <span class="font-semibold">{{ props.stats.gamesPlayed.asWhite }}</span>
              </div>
            </div>
            <div class="col-6">
              <div class="flex align-items-center justify-content-between">
                <span>Black</span>
                <span class="font-semibold">{{ props.stats.gamesPlayed.asBlack }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div class="mb-4">
          <h4 class="text-lg mb-2">Results</h4>
          <div class="grid">
            <div class="col-4">
              <div class="text-center">
                <div class="font-semibold text-green-600">{{ props.stats.results.wins.total }}</div>
                <div class="text-sm">Wins</div>
              </div>
            </div>
            <div class="col-4">
              <div class="text-center">
                <div class="font-semibold text-red-600">{{ props.stats.results.losses.total }}</div>
                <div class="text-sm">Losses</div>
              </div>
            </div>
            <div class="col-4">
              <div class="text-center">
                <div class="font-semibold text-gray-600">{{ props.stats.results.draws.total }}</div>
                <div class="text-sm">Draws</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Averages -->
        <div>
          <h4 class="text-lg mb-2">Averages</h4>
          <div class="grid">
            <div class="col-12 mb-2">
              <div class="flex align-items-center justify-content-between">
                <span>Moves per Game</span>
                <span class="font-semibold">{{ props.stats.averages.movesPerGame }}</span>
              </div>
            </div>
            <div class="col-12">
              <div class="flex align-items-center justify-content-between">
                <span>Captured Pieces</span>
                <span class="font-semibold">{{ props.stats.averages.capturedPieces }}</span>
              </div>
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
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow:
    0 2px 1px -1px rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
}
</style>
