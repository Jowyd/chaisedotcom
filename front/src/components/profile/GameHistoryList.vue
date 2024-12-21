<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const props = defineProps<{
  username: string;
  publicView: boolean;
}>();

const router = useRouter();
const toast = useToast();
const games = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalGames = ref(0);

const selectedGames = ref<string[]>([]);
const bulkVisibility = ref<'public' | 'private'>('public');

const loadGames = async () => {
  loading.value = true;
  try {
    // Simuler un appel API
    games.value = [
      {
        id: '1',
        opponent: 'Magnus C.',
        date: '2024-03-15',
        result: 'Won',
        rating_change: '+12',
        moves: 45,
        duration: '25:30',
        color: 'white',
      },
      {
        id: '2',
        opponent: 'Hikaru N.',
        date: '2024-03-14',
        result: 'Lost',
        rating_change: '-8',
        moves: 32,
        duration: '15:45',
        color: 'black',
      },
    ];
    totalGames.value = 150; // Nombre total de parties pour la pagination
  } catch (error) {
    console.error('Error loading games:', error);
  } finally {
    loading.value = false;
  }
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const navigateToGame = (gameId: string) => {
  router.push(`/game/${gameId}`);
};

const toggleGameVisibility = async (gameId: string, isPublic: boolean) => {
  loading.value = true;
  try {
    // Appel API pour mettre à jour la visibilité
    // await GameService.updateGameVisibility(gameId, isPublic);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Game visibility updated to ${isPublic ? 'public' : 'private'}`,
      life: 3000,
    });
  } catch (error) {
    console.error('Error updating game visibility:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update game visibility',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const updateBulkVisibility = async () => {
  if (!selectedGames.value.length) {
    toast.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Please select games to update',
      life: 3000,
    });
    return;
  }

  loading.value = true;
  try {
    // Appel API pour mettre à jour la visibilité en masse
    // await GameService.updateBulkGameVisibility(selectedGames.value, bulkVisibility.value === 'public');
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Updated visibility for ${selectedGames.value.length} games`,
      life: 3000,
    });
    selectedGames.value = [];
  } catch (error) {
    console.error('Error updating game visibility:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update game visibility',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

watch(() => props.username, loadGames);

onMounted(() => {
  loadGames();
});
</script>

<template>
  <div class="card">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold m-0">Game History</h2>
      
      <!-- Actions en masse pour la visibilité (visible uniquement si c'est notre profil) -->
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

    <DataTable
      v-model:selection="selectedGames"
      :value="games"
      :loading="loading"
      paginator
      :rows="itemsPerPage"
      :totalRecords="totalGames"
      :rowsPerPageOptions="[10, 20, 50]"
      v-model:first="currentPage"
      tableStyle="min-width: 50rem"
      class="p-datatable-sm"
      :selection-mode="!publicView ? 'multiple' : undefined"
      dataKey="id"
    >
      <!-- Colonne de sélection (visible uniquement si c'est notre profil) -->
      <Column v-if="!publicView" selectionMode="multiple" style="width: 3rem" />

      <Column field="date" header="Date" :sortable="true">
        <template #body="{ data }">
          {{ formatDate(data.date) }}
        </template>
      </Column>
      <Column field="opponent" header="Opponent" :sortable="true">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <Avatar
              :image="`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.opponent}`"
              size="small"
              shape="circle"
            />
            <span>{{ data.opponent }}</span>
          </div>
        </template>
      </Column>
      <Column field="color" header="Color" :sortable="true">
        <template #body="{ data }">
          <i
            :class="`pi ${data.color === 'white' ? 'pi-circle-fill text-white' : 'pi-circle-fill text-900'}`"
            style="font-size: 0.5rem; text-shadow: 0 0 2px rgba(0,0,0,0.5);"
          ></i>
        </template>
      </Column>
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
      <Column v-if="!publicView" field="isPublic" header="Visibility" :sortable="true">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <InputSwitch
              v-model="data.isPublic"
              @change="toggleGameVisibility(data.id, data.isPublic)"
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