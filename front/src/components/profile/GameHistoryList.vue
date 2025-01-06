<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { GameHistoryFilters, GameHistoryItem } from '@/types';
import { GameService } from '@/services/GameService';
import { useErrorHandler } from '@/composables/useErrorHandler';
import { ErrorService } from '@/services/ErrorService';

const props = defineProps<{
  username: string;
  publicView: boolean;
}>();

const router = useRouter();
const games = ref<GameHistoryItem[]>([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalGames = ref(0);

const selectedGames = ref<number[]>([]);
const bulkVisibility = ref<'public' | 'private'>('public');
const { loading, withErrorHandling } = useErrorHandler();

const getResultClass = (game: GameHistoryItem) => {
  if (!game.result) {
    return 'bg-gray-100 text-gray-700 border-round-sm px-2 py-1';
  }
  if (game.result == 0) {
    return 'bg-gray-100 text-gray-700 border-round-sm px-2 py-1';
  }
  if (game.result > 0) {
    return 'bg-green-100 text-gray-700 border-round-sm px-2 py-1';
  } else {
    return 'bg-red-100 text-green-700 border-round-sm px-2 py-1';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const navigateToGame = (gameId: string) => {
  router.push(`/game/${gameId}`);
};

const toggleGameVisibility = async (gameId: number, isPublic: boolean) => {
  await withErrorHandling(async () => {
    await GameService.updateGameVisibility(gameId, isPublic);
    ErrorService.handleSuccess(`Game visibility updated to ${isPublic ? 'public' : 'private'}`);
    return true;
  }, 'Game Visibility Update');
};

const updateBulkVisibility = async () => {
  if (!selectedGames.value.length) {
    ErrorService.handleError({
      code: 'INVALID_REQUEST',
      message: 'Please select games to update',
      response: {
        data: {
          status: 400,
          message: 'Bad Request',
        },
        status: 400,
      },
    });
    return;
  }

  await withErrorHandling(async () => {
    await GameService.updateBulkGameVisibility(
      selectedGames.value,
      bulkVisibility.value === 'public',
    );
    ErrorService.handleSuccess(`Updated visibility for ${selectedGames.value.length} games`);
    selectedGames.value = [];
    await loadGames();
    return true;
  }, 'Bulk Visibility Update');
};

const isGameEnded = (game: GameHistoryItem) => {
  return game.status.toLowerCase() !== 'in_progress' && game.status.toLowerCase() !== 'check';
};

const getUserColor = (game: GameHistoryItem) => {
  return game.opponentColor === 'BLACK' ? 'white' : 'black';
};

const dateRange = ref();
const selectedResult = ref();

const formatResult = (result: number) => {
  if (!result) {
    return '-';
  }
  return result;
};

const loadGames = async () => {
  console.log('loadGames');
  const filters: GameHistoryFilters = {
    dateRange: dateRange.value,
    result: selectedResult.value,
    page: currentPage.value - 1,
    itemsPerPage: itemsPerPage.value,
  };

  const response = await withErrorHandling(
    () => GameService.getGameHistory(props.username, filters),
    'Game History Loading',
  );

  if (response) {
    games.value = response.games;
    totalGames.value = response.total;
  }
};

watch([dateRange, selectedResult, currentPage, itemsPerPage], () => {
  loadGames();
});

onMounted(() => {
  loadGames();
});

const onPageChange = (event: { page: number; rows: number }) => {
  currentPage.value = event.page + 1;
  itemsPerPage.value = event.rows;
};
</script>

<template>
  <div class="card">
    <div class="flex flex-column justify-content-start align-items-center mb-4">
      <!-- <h2 class="text-2xl font-bold m-0 mb-4">Game History</h2> -->
      <div class="w-full flex justify-content-between align-items-center">
        <div class="flex gap-3">
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            placeholder="Date Range"
            class="w-20rem"
            :showIcon="true"
          />
          <!-- <Dropdown
            v-model="selectedResult"
            :options="results"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter by Result"
            class="w-12rem"
          /> -->
        </div>
        <div v-if="!publicView" class="flex align-items-center gap-3">
          <Dropdown
            v-model="bulkVisibility"
            :options="[
              { label: 'Make Public', value: 'public' },
              { label: 'Make Private', value: 'private' },
            ]"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Action"
          />
          <Button
            label="Apply"
            :disabled="!selectedGames.length"
            @click="updateBulkVisibility"
            :loading="loading"
          />
        </div>
      </div>
    </div>

    <DataTable
      v-model:selection="selectedGames"
      :value="games"
      :loading="loading"
      paginator
      :lazy="true"
      :totalRecords="totalGames"
      @page="onPageChange"
      :rows="itemsPerPage"
      :rowsPerPageOptions="[10, 20, 50]"
      tableStyle="min-width: 50rem"
      class="p-datatable-sm"
      :selection-mode="!publicView ? 'multiple' : undefined"
      dataKey="game_id"
    >
      <Column v-if="!publicView" selectionMode="multiple" style="width: 3rem" />

      <Column field="date" header="Date" :sortable="true">
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </Column>
      <Column field="opponent" header="Opponent" :sortable="true">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <Avatar
              :image="`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.opponent}`"
              size="normal"
              shape="circle"
            />
            <span>{{ data.opponentName }}</span>
          </div>
        </template>
      </Column>
      <Column field="color" header="Color" :sortable="true">
        <template #body="{ data }">
          <i
            class="pi pi-circle-fill"
            :style="{ color: getUserColor(data) }"
            style="font-size: 0.5rem; text-shadow: 0 0 2px rgba(0, 0, 0, 0.5)"
          ></i>
        </template>
      </Column>
      <Column field="result" header="Result" :sortable="true">
        <template #body="{ data }">
          <span :class="getResultClass(data)">{{ formatResult(data.result) }}</span>
        </template>
      </Column>
      <Column field="rating_change" header="Rating" :sortable="true">
        <template #body="{ data }">
          <span :class="data.winner == props.username ? 'text-green-500' : 'text-red-500'">
            {{ 50 }}
          </span>
        </template>
      </Column>
      <Column field="moves" header="Moves" :sortable="true" />
      <Column field="status" header="Status" :sortable="true" />
      <Column header="Actions">
        <template #body="{ data }">
          <Button
            v-if="isGameEnded(data)"
            icon="pi pi-eye"
            text
            rounded
            @click="navigateToGame(data.game_id)"
            v-tooltip.top="'View Game'"
          />
          <Button
            v-else
            icon="pi pi-spinner"
            text
            rounded
            v-tooltip.top="'Resume the game'"
            @click="navigateToGame(data.game_id)"
            class="text-gray-500"
          />
        </template>
      </Column>
      <Column v-if="!publicView" field="isPublic" header="Visibility" :sortable="true">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <InputSwitch
              v-model="data.isPublic"
              @change="toggleGameVisibility(data.game_id, data.isPublic)"
            />
            <span class="text-sm">{{ data.isPublic ? 'Public' : 'Private' }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

:deep(.p-inputswitch) {
  transform: scale(0.8);
}
</style>
