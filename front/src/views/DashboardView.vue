<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import CreateGameDialog from '@/components/CreateGameDialog.vue';
import { GameService } from '@/services/GameService';
import { useToast } from 'primevue/usetoast';
import { authService } from '@/services/AuthService';
import type { ChessColor, GameHistoryFilters, UserStats } from '@/types';
import type { GameHistoryItem } from '@/types';
import { userService } from '@/services/UserService';

const router = useRouter();
const toast = useToast();
const showCreateGame = ref<boolean>(false);
const recentGames = ref<GameHistoryItem[]>([]);
const isLoading = ref<boolean>(true);
const stats = ref<UserStats>();

onMounted(async () => {
  try {
    // Charger les parties récentes
    const username = authService.getUser()?.username;

    // Charger les statistiques
    if (username) {
      const filter: GameHistoryFilters = {
        itemsPerPage: 5,
        page: 0,
      };
      recentGames.value = await GameService.getGameHistory(username, filter);
      const userStats = await userService.getUserStats(username);
      stats.value = userStats;
      console.log('User stats:', userStats);
    } else {
      throw new Error('Username is undefined');
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load dashboard data',
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
});

const handleCreateGame = async (gameDetails: {
  opponent: string;
  colorAssignment: 'random' | 'fixed';
  playerColor?: ChessColor;
  isPublic: boolean;
}) => {
  try {
    const newGame = await GameService.createGame(gameDetails);
    toast.add({
      severity: 'success',
      summary: 'Game Created',
      detail: 'New game has been created successfully',
      life: 3000,
    });
    router.push(`/game/${newGame.id}`);
  } catch (error) {
    console.error('Error creating game:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create game. Please try again.',
      life: 3000,
    });
  }
};
</script>

<template>
  <div class="flex">
    <DashboardSidebar />

    <div class="flex-1 p-4">
      <!-- Welcome Section -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-4xl font-bold m-0 mb-2">
            Welcome back, {{ authService.getUser()?.username }}!
          </h1>
          <p class="text-700 m-0">Ready for your next game?</p>
        </div>
        <Button
          label="Play Now"
          icon="pi pi-play"
          severity="primary"
          size="large"
          @click="showCreateGame = true"
        />
      </div>

      <!-- Stats Cards -->
      <div class="grid">
        <div class="col-12 md:col-3">
          <div class="surface-card p-4 shadow-2 border-round">
            <div class="text-900 font-medium mb-2">Rating</div>
            <div class="text-2xl font-bold">{{ stats?.rating }}</div>
          </div>
        </div>
        <div class="col-12 md:col-3">
          <div class="surface-card p-4 shadow-2 border-round">
            <div class="text-900 font-medium mb-2">Games Played</div>
            <div class="text-2xl font-bold">{{ stats?.gamesPlayed.total }}</div>
          </div>
        </div>
        <div class="col-12 md:col-3">
          <div class="surface-card p-4 shadow-2 border-round">
            <div class="text-900 font-medium mb-2">Win Rate</div>
            <div class="text-2xl font-bold">
              {{
                stats?.results?.wins?.total && stats?.gamesPlayed?.total
                  ? ((stats.results.wins.total / stats.gamesPlayed.total) * 100).toFixed(3)
                  : 0
              }}%
            </div>
          </div>
        </div>
        <div class="col-12 md:col-3">
          <div class="surface-card p-4 shadow-2 border-round">
            <div class="text-900 font-medium mb-2">Current Streak</div>
            <div class="text-2xl font-bold">{{ stats?.currentStreak }}</div>
          </div>
        </div>
      </div>

      <!-- Recent Games -->
      <div class="mt-4 flex flex-column">
        <h2 class="text-2xl font-bold mb-3">Recent Games</h2>
        <DataTable
          :value="recentGames"
          :loading="isLoading"
          class="p-datatable-sm"
          responsiveLayout="scroll"
        >
          <Column field="opponentName" header="Opponent" />
          <Column field="result" header="Result">
            <template #body="{ data }">
              <Tag :severity="data.result > 0 ? 'success' : data.result < 0 ? 'danger' : 'info'">
                {{
                  data.result > 0
                    ? 'Won'
                    : data.result < 0
                      ? 'Lost'
                      : data.result === 0
                        ? 'Draw'
                        : '-'
                }}
              </Tag>
            </template>
          </Column>
          <Column field="moves" header="Moves" />
          <Column field="createdAt" header="Date">
            <template #body="{ data }">
              {{ new Date(data.createdAt).toLocaleDateString() }}
            </template>
          </Column>
          <Column>
            <template #body="{ data }">
              <Button icon="pi pi-eye" text rounded @click="router.push(`/game/${data.game_id}`)" />
            </template>
          </Column>
        </DataTable>
        <Button
          label="View All"
          icon="pi pi-list"
          class="mt-4 mx-auto"
          @click="router.push('/history')"
        />
      </div>
    </div>

    <CreateGameDialog v-model:visible="showCreateGame" @create-game="handleCreateGame" />
  </div>
</template>

<style scoped>
.dashboard-content {
  min-height: 100vh;
  background: var(--surface-ground);
}
</style>
