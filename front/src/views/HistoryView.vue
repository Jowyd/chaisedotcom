<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const router = useRouter();
const games = ref([]);
const loading = ref(true);
const dateRange = ref();
const selectedResult = ref();

const results = [
  { label: 'All Results', value: null },
  { label: 'Victory', value: 'won' },
  { label: 'Defeat', value: 'lost' },
  { label: 'Draw', value: 'draw' },
];

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const getResultClass = (result: string) => {
  switch (result.toLowerCase()) {
    case 'won':
      return 'bg-green-100 text-green-700 border-round-sm px-2 py-1';
    case 'lost':
      return 'bg-red-100 text-red-700 border-round-sm px-2 py-1';
    default:
      return 'bg-gray-100 text-gray-700 border-round-sm px-2 py-1';
  }
};

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
      // ... ajoutez plus de données simulées
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

        <!-- Table des parties -->
        <DataTable
          :value="games"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          tableStyle="min-width: 50rem"
          class="p-datatable-sm"
        >
          <Column field="date" header="Date" :sortable="true">
            <template #body="{ data }">
              {{ formatDate(data.date) }}
            </template>
          </Column>
          <Column field="opponent" header="Opponent" :sortable="true" />
          <Column field="result" header="Result" :sortable="true">
            <template #body="{ data }">
              <span :class="getResultClass(data.result)">{{ data.result }}</span>
            </template>
          </Column>
          <Column field="rating_change" header="Rating" :sortable="true">
            <template #body="{ data }">
              <span :class="data.rating_change.includes('+') ? 'text-green-500' : 'text-red-500'">
                {{ data.rating_change }}
              </span>
            </template>
          </Column>
          <Column field="moves" header="Moves" :sortable="true" />
          <Column field="duration" header="Duration" :sortable="true" />
          <Column header="Actions">
            <template #body="{ data }">
              <Button
                icon="pi pi-eye"
                text
                rounded
                @click="navigateToGame(data.id)"
                v-tooltip.top="'View Game'"
              />
            </template>
          </Column>
        </DataTable>
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