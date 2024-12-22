<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import GameHistoryList from '@/components/profile/GameHistoryList.vue';

const router = useRouter();
const games = ref([]);
const loading = ref(true);
const dateRange = ref();
const selectedResult = ref();
const username = 'aze';

const results = [
  { label: 'All Results', value: null },
  { label: 'Victory', value: 'won' },
  { label: 'Defeat', value: 'lost' },
  { label: 'Draw', value: 'draw' },
];

const navigateToGame = (gameId: string) => {
  router.push(`/game/${gameId}`);
};

// Simulons des données pour l'exemple
onMounted(() => {
  setTimeout(() => {
    games.value = [
      {
        id: '1',
        opponent: 'Magnus C.',
        date: '2024-03-15',
        result: 'Won',
        rating_change: '+12',
        moves: 45,
        duration: '25:30',
      },
    ];
    loading.value = false;
  }, 1000);
});
</script>

<template>
  <div class="flex">
    <DashboardSidebar />

    <div class="flex-1 p-4">
      <div class="card">
        <h1 class="text-3xl font-bold mb-4">Game History</h1>

        <!-- Filtres -->
        <div class="flex gap-3 mb-4">
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            placeholder="Date Range"
            class="w-20rem"
          />
          <Dropdown
            v-model="selectedResult"
            :options="results"
            optionLabel="label"
            placeholder="Filter by Result"
            class="w-12rem"
          />
        </div>

        <GameHistoryList :username="username" :public-view="true" />
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
