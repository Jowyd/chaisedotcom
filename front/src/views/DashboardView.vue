<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <div class="flex justify-content-between align-items-center p-4 bg-800 border-bottom-1 border-bluegray-700">
      <h1 class="text-xl m-0">Chess Online</h1>
      <Button icon="pi pi-sign-out" severity="danger" @click="handleLogout" />
    </div>

    <!-- Main Content -->
    <div class="grid p-4">
      <!-- Stats Card -->
      <div class="col-12 md:col-6 lg:col-3">
        <Card>
          <template #title>Statistics</template>
          <template #content>
            <div class="flex flex-column gap-3">
              <div class="flex justify-content-between">
                <span>Games Played</span>
                <span class="font-bold">24</span>
              </div>
              <div class="flex justify-content-between">
                <span>Wins</span>
                <span class="font-bold text-green-500">15</span>
              </div>
              <div class="flex justify-content-between">
                <span>Losses</span>
                <span class="font-bold text-red-500">9</span>
              </div>
              <div class="flex justify-content-between">
                <span>Rating</span>
                <span class="font-bold">1250</span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Quick Play Card -->
      <div class="col-12 md:col-6 lg:col-9">
        <Card>
          <template #title>Quick Play</template>
          <template #content>
            <div class="flex flex-column gap-3">
              <div class="flex gap-3 justify-content-center">
                <Button label="Play vs Computer" icon="pi pi-desktop" />
                <Button label="Find Match" icon="pi pi-users" severity="success" />
                <Button label="Create Private Game" icon="pi pi-lock" severity="help" />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Recent Games -->
      <div class="col-12">
        <Card>
          <template #title>Recent Games</template>
          <template #content>
            <div class="flex flex-column gap-3">
              <div v-for="i in 3" :key="i" class="flex justify-content-between align-items-center p-3 border-1 border-bluegray-700 border-round">
                <div class="flex align-items-center gap-3">
                  <i class="pi" :class="i % 2 === 0 ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'"></i>
                  <span>vs Player{{ i }}</span>
                </div>
                <div class="flex align-items-center gap-3">
                  <span>{{ i % 2 === 0 ? 'Won' : 'Lost' }}</span>
                  <span class="text-gray-400">{{ new Date().toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>