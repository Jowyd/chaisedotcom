<script setup lang="ts">
import { authService } from '@/services/AuthService';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const menuItems = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    command: () => router.push('/dashboard'),
  },
  {
    label: 'Leaderboard',
    icon: 'pi pi-trophy',
    command: () => router.push('/leaderboard'),
  },
  {
    label: 'History',
    icon: 'pi pi-clock',
    command: () => router.push('/history'),
  },
  {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => router.push('/profile/' + authService.getUser()?.username),
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    command: () => router.push('/settings'),
  },
  {
    label: 'Logout',
    icon: 'pi pi-power-off',
    command: () => router.push('/login'),
  },
]);
</script>

<template>
  <div class="sidebar surface-section flex flex-column">
    <!-- Logo and Brand -->
    <div class="p-4 text-center border-bottom-1 surface-border">
      <div class="text-xl font-bold">ChaiseDotCom</div>
    </div>

    <!-- User Profile -->
    <div class="p-4 flex flex-column align-items-center border-bottom-1 surface-border">
      <Avatar
        :image="`https://api.dicebear.com/7.x/avataaars/svg?seed=${authService?.getUser()?.username}`"
        size="large"
        shape="circle"
        class="mb-2"
      />
      <div class="text-lg font-semibold">{{ authService?.getUser()?.username }}</div>
    </div>

    <!-- Navigation Menu -->
    <div class="flex-1 overflow-y-auto">
      <ul class="list-none p-3 m-0">
        <li v-for="item in menuItems" :key="item.label" class="mb-2">
          <a
            @click="item.command"
            class="flex align-items-center cursor-pointer p-3 border-round-lg hover:surface-hover transition-duration-150 no-underline"
          >
            <i :class="item.icon" class="mr-3 text-700"></i>
            <span class="font-medium text-700">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 260px;
  border-right: 1px solid var(--surface-border);
}
</style>
