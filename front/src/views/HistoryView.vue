<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import { GameService } from '@/services/GameService';
import { useToast } from 'primevue/usetoast';
import { authService } from '@/services/AuthService';
import type { GameHistoryFilters, GameHistoryItem } from '@/types';
import GameHistoryList from '@/components/profile/GameHistoryList.vue';
const toast = useToast();
const loading = ref(true);
const dateRange = ref();
const selectedResult = ref();
const games = ref<GameHistoryItem[]>([]);

const loadGames = async () => {
  loading.value = true;
  try {
    const filters: GameHistoryFilters = {
      dateRange: dateRange.value,
      result: selectedResult.value,
      itemsPerPage: 10,
      page: 0,
    };
    const username = authService.getUser()?.username || '';
    games.value = await GameService.getGameHistory(username, filters);
  } catch (error) {
    console.error('Error loading games:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load game history',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

watch([dateRange, selectedResult], () => {
  loadGames();
});

onMounted(() => {
  loadGames();
});
</script>

<template>
  <div class="flex">
    <DashboardSidebar />

    <div class="flex-1 p-4">
      <div class="card">
        <h1 class="text-3xl font-bold mb-4">Game History</h1>

        <GameHistoryList
          :username="authService.getUser()?.username || ''"
          :public-view="false"
          :loading="loading"
        />
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
