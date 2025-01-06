<script setup lang="ts">
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import { authService } from '@/services/AuthService';
import GameHistoryList from '@/components/profile/GameHistoryList.vue';
</script>

<template>
  <div class="flex">
    <DashboardSidebar />

    <div class="flex-1 p-4">
      <div class="card">
        <h1 class="text-3xl font-bold mb-4">Game History</h1>

        <GameHistoryList :username="authService.getUser()?.username || ''" :public-view="false" />
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
