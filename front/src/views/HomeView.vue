<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Button } from 'primevue';
const router = useRouter();

const navigateToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="landing-page">
    <div class="grid grid-nogutter surface-section h-screen">
      <div class="col-12 flex justify-content-between align-items-center px-5 py-3 surface-0">
        <div class="text-3xl font-bold">ChessOnline</div>
        <Button label="Login" @click="navigateToLogin" severity="secondary" text />
      </div>

      <div
        class="col-12 flex flex-column md:flex-row align-items-center justify-content-center gap-5 py-8"
      >
        <div class="flex flex-column gap-4 px-4 md:px-6">
          <div class="text-6xl font-bold">Play Chess Online</div>
          <div class="text-xl line-height-3 text-700">
            Challenge players worldwide, improve your skills, and join our growing community of
            chess enthusiasts.
          </div>
          <div class="flex gap-3">
            <Button
              label="Play Now"
              icon="pi pi-play"
              @click="navigateToLogin"
              severity="primary"
              size="large"
            />
            <Button
              label="Learn More"
              icon="pi pi-info-circle"
              severity="secondary"
              size="large"
              text
            />
          </div>
        </div>
        <div class="w-full md:w-6 flex justify-content-center">
          <img
            src="https://images.unsplash.com/photo-1528819622765-d6bcf132f793?ixlib=rb-4.0.3&auto=format&fit=crop&w=600"
            alt="Chess pieces"
            class="w-full max-w-30rem border-round-xl shadow-2"
          />
        </div>
      </div>

      <div class="col-12 px-4 py-8 surface-ground">
        <div class="grid">
          <div class="col-12 md:col-4 p-4">
            <Card>
              <template #header>
                <i class="pi pi-users text-4xl text-primary mb-3"></i>
              </template>
              <template #title>Play with Friends</template>
              <template #content>
                Challenge your friends or find new opponents from around the world.
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4 p-4">
            <Card>
              <template #header>
                <i class="pi pi-chart-line text-4xl text-primary mb-3"></i>
              </template>
              <template #title>Track Progress</template>
              <template #content>
                Monitor your performance and improve your game with detailed statistics.
              </template>
            </Card>
          </div>
          <div class="col-12 md:col-4 p-4">
            <Card>
              <template #header>
                <i class="pi pi-book text-4xl text-primary mb-3"></i>
              </template>
              <template #title>Learn Strategies</template>
              <template #content>
                Access tutorials and learn from experienced players to enhance your skills.
              </template>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  background: var(--surface-ground);
}
</style>
