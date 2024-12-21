<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  username: string;
}>();

const stats = ref({
  rating: 1500,
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
  averageGameLength: 0,
  favoriteOpenings: [],
});

onMounted(async () => {
  // Charger les statistiques depuis l'API
});
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
      <div class="col-6 sm:col-3">
        <div class="text-center">
          <div class="text-2xl font-bold">{{ stats.gamesPlayed }}</div>
          <div class="text-600">Games</div>
        </div>
      </div>
      <div class="col-6 sm:col-3">
        <div class="text-center">
          <div class="text-2xl font-bold text-green-500">{{ stats.wins }}</div>
          <div class="text-600">Wins</div>
        </div>
      </div>
      <div class="col-6 sm:col-3">
        <div class="text-center">
          <div class="text-2xl font-bold text-red-500">{{ stats.losses }}</div>
          <div class="text-600">Losses</div>
        </div>
      </div>
      <div class="col-6 sm:col-3">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-500">{{ stats.draws }}</div>
          <div class="text-600">Draws</div>
        </div>
      </div>

      <!-- Statistiques détaillées -->
      <div class="col-12 mt-4">
        <div class="surface-ground p-3 border-round">
          <div class="flex justify-content-between mb-3">
            <span class="text-600">Win Rate</span>
            <span class="font-medium">{{ stats.winRate }}%</span>
          </div>
          <div class="flex justify-content-between">
            <span class="text-600">Avg. Game Length</span>
            <span class="font-medium">{{ stats.averageGameLength }} moves</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 