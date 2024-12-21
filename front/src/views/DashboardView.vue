<script setup lang="ts">
import { ref } from 'vue';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import CreateGameDialog from '@/components/CreateGameDialog.vue';
import ChessBoard from '@/components/ChessBoard.vue';

const showCreateGame = ref(false);

const recentGames = [
  { opponent: 'Magnus C.', result: 'Won', rating: '+12', date: '2024-03-15' },
  { opponent: 'Hikaru N.', result: 'Lost', rating: '-8', date: '2024-03-14' },
  { opponent: 'Beth H.', result: 'Draw', rating: '+0', date: '2024-03-13' },
];

const handleCreateGame = (gameDetails: { opponent: string; timeControl: string }) => {
  console.log('Creating game with:', gameDetails);
  // TODO: Implement game creation logic
};
</script>

<template>
  <div class="flex">
    <DashboardSidebar />

    <div class="flex-1 p-4">
      <!-- Welcome Section -->
      <div class="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="text-4xl font-bold m-0 mb-2">Welcome back, John!</h1>
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

      <div class="grid">
        <!-- Chess Board -->
        <!-- <div class="col-12 lg:col-8">
          <Card>
            <template #title>Current Game</template>
            <template #content>
              <ChessBoard />
            </template>
          </Card>
        </div> -->

        <div class="col-12 md:col-6 lg:col-3">
          <Card class="mb-4">
            <template #title>Games Played</template>
            <template #content>
              <div class="text-3xl font-bold text-primary">142</div>
              <div class="text-500">12 this week</div>
            </template>
          </Card>
        </div>
        <!-- Recent Games -->
        <div class="col-12">
          <Card>
            <template #title>Recent Games</template>
            <template #content>
              <div class="flex flex-column gap-3">
                <div
                  v-for="game in recentGames"
                  :key="game.opponent"
                  class="flex align-items-center justify-content-between p-3 border-round surface-ground"
                >
                  <div class="flex align-items-center">
                    <Avatar icon="pi pi-user" size="large" shape="circle" class="mr-3" />
                    <div>
                      <div class="font-medium">{{ game.opponent }}</div>
                      <div class="text-500">{{ game.date }}</div>
                    </div>
                  </div>
                  <div class="flex align-items-center gap-3">
                    <span
                      :class="{
                        'text-green-500': game.result === 'Won',
                        'text-red-500': game.result === 'Lost',
                        'text-gray-500': game.result === 'Draw',
                      }"
                      >{{ game.result }}</span
                    >
                    <span class="font-medium">{{ game.rating }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template #footer>
              <Button label="View All" icon="pi pi-angle-right" @click="$router.push('/history')" />
            </template>
          </Card>
        </div>
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
