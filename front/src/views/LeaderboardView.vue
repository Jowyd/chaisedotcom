<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardSidebar from '@/components/DashboardSidebar.vue';

const router = useRouter();
const players = ref([]);
const loading = ref(true);
const timeRange = ref('all'); // 'all', 'month', 'week'

const timeRanges = [
  { label: 'All Time', value: 'all' },
  { label: 'This Month', value: 'month' },
  { label: 'This Week', value: 'week' },
];

const loadLeaderboard = async () => {
  loading.value = true;
  try {
    // Charger le classement depuis l'API
    players.value = [
      {
        rank: 1,
        username: 'Magnus C.',
        rating: 2800,
        gamesPlayed: 150,
        winRate: 75.5,
      },
      // ... plus de données
    ];
  } catch (error) {
    console.error('Error loading leaderboard:', error);
  } finally {
    loading.value = false;
  }
};

const navigateToProfile = (username: string) => {
  router.push(`/profile/${username}`);
};

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
            @change="loadLeaderboard"
          />
        </div>

        <DataTable
          :value="players"
          :loading="loading"
          paginator
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          tableStyle="min-width: 50rem"
          class="p-datatable-sm"
        >
          <Column field="rank" header="Rank" style="width: 5rem">
            <template #body="{ data }">
              <div class="flex align-items-center justify-content-center">
                <span
                  :class="{
                    'text-yellow-500': data.rank === 1,
                    'text-gray-500': data.rank === 2,
                    'text-orange-500': data.rank === 3,
                  }"
                >
                  {{ data.rank }}
                </span>
              </div>
            </template>
          </Column>
          <Column field="username" header="Player">
            <template #body="{ data }">
              <div class="flex align-items-center gap-2 cursor-pointer" @click="navigateToProfile(data.username)">
                <Avatar
                  :image="`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`"
                  size="small"
                  shape="circle"
                />
                <span class="font-medium">{{ data.username }}</span>
              </div>
            </template>
          </Column>
          <Column field="rating" header="Rating" :sortable="true">
            <template #body="{ data }">
              <span class="font-medium">{{ data.rating }}</span>
            </template>
          </Column>
          <Column field="gamesPlayed" header="Games" :sortable="true" />
          <Column field="winRate" header="Win Rate" :sortable="true">
            <template #body="{ data }">
              <span>{{ data.winRate }}%</span>
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