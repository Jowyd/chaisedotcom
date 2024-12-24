<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import { leaderboardService, type LeaderboardPlayer } from '@/services/LeaderboardService';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();
const players = ref<LeaderboardPlayer[]>([]);
const loading = ref(true);
const timeRange = ref('all');
const currentPage = ref(0);
const itemsPerPage = ref(10);
const totalPlayers = ref(0);

const timeRanges = [
  { label: 'All Time', value: 'all' },
  { label: 'This Month', value: 'month' },
  { label: 'This Week', value: 'week' },
];

const loadLeaderboard = async () => {
  loading.value = true;
  try {
    const data = await leaderboardService.getLeaderboard({
      timeRange: timeRange.value as 'all' | 'month' | 'week',
      page: currentPage.value,
      itemsPerPage: itemsPerPage.value,
    });
    players.value = data.players.map((player: any, index: number) => ({
      ...player,
      rank: currentPage.value * itemsPerPage.value + index + 1,
    }));
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load leaderboard',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const navigateToProfile = (username: string) => {
  router.push(`/profile/${username}`);
};

const getRankClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'text-yellow-500 font-bold text-xl';
    case 2:
      return 'text-bluegray-500 font-bold text-lg';
    case 3:
      return 'text-orange-500 font-bold text-lg';
    default:
      return 'text-700';
  }
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return 'pi pi-star-fill text-yellow-500';
    case 2:
      return 'pi pi-star-fill text-bluegray-500';
    case 3:
      return 'pi pi-star-fill text-orange-500';
    default:
      return '';
  }
};

watch([timeRange, currentPage, itemsPerPage], () => {
  loadLeaderboard();
});

onMounted(() => {
  loadLeaderboard();
});
</script>

<template>
  <div class="flex">
    <DashboardSidebar />

    <div class="flex-1 p-4">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <h1 class="text-3xl font-bold m-0">Leaderboard</h1>
          <Dropdown
            v-model="timeRange"
            :options="timeRanges"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Time Range"
          />
        </div>

        <DataTable
          :value="players"
          :loading="loading"
          paginator
          :rows="itemsPerPage"
          v-model:first="currentPage"
          :rowsPerPageOptions="[10, 20, 50]"
          tableStyle="min-width: 50rem"
          class="p-datatable-sm"
          :total-records="totalPlayers"
        >
          <Column field="rank" header="Rank" style="width: 5rem">
            <template #body="{ data }">
              <div class="flex align-items-center justify-content-center">
                <span :class="getRankClass(data.rank)">
                  {{ data.rank }}
                  <i v-if="data.rank <= 3" :class="getRankIcon(data.rank)" />
                </span>
              </div>
            </template>
          </Column>

          <Column field="username" header="Player">
            <template #body="{ data }">
              <div
                class="flex align-items-center gap-2 cursor-pointer"
                @click="navigateToProfile(data.username)"
              >
                <Avatar
                  :image="`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`"
                  size="normal"
                  shape="circle"
                />
                <span class="font-medium">{{ data.username }}</span>
              </div>
            </template>
          </Column>

          <Column field="rating" header="Rating" :sortable="true">
            <template #body="{ data }">
              <div class="flex align-items-center">
                <span class="font-medium">{{ data.rating }}</span>
              </div>
            </template>
          </Column>

          <Column field="gamesPlayed" header="Games" :sortable="true" />

          <Column field="winRate" header="Win Rate" :sortable="true">
            <template #body="{ data }">
              <div class="flex align-items-center">
                <div class="relative w-8rem h-0.5rem bg-gray-200 border-round">
                  <div
                    class="absolute top-0 left-0 h-full border-round bg-primary"
                    :style="{ width: `${data.winRate}%` }"
                  ></div>
                </div>
                <span class="ml-2">{{ data.winRate }}%</span>
              </div>
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

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  cursor: pointer;
}

:deep(.p-dropdown) {
  min-width: 10rem;
}
</style>
