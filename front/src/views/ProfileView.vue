<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import GameHistoryList from '@/components/profile/GameHistoryList.vue';
import PlayerStats from '@/components/profile/PlayerStats.vue';
import { authService } from '@/services/AuthService';
import { userService, type UserProfile } from '@/services/UserService';
import type { ErrorMessages } from '@/types';
import router from '@/router';

const route = useRoute();
const toast = useToast();
const username = ref(route.params.username as string);
const isOwnProfile = computed(() => authService.getUser()?.username === username.value);

const loading = ref(false);
const userProfile = ref<UserProfile | undefined>();
const privacySettings = ref({
  publicProfile: true,
  showGameHistory: true,
});

const userStats = ref({
  rating: 1500,
  gamesPlayed: {
    total: 0,
    asWhite: 0,
    asBlack: 0,
  },
  results: {
    wins: { total: 0, asWhite: 0, asBlack: 0 },
    losses: { total: 0, asWhite: 0, asBlack: 0 },
    draws: { total: 0, asWhite: 0, asBlack: 0 },
  },
  averages: {
    movesPerGame: 0,
    gameLength: '00:00',
    capturedPieces: 0,
  },
  bestWinStreak: 0,
  currentStreak: 0,
});

const loadProfile = async () => {
  try {
    const profile = await userService.getProfile(username.value);
    userProfile.value = profile;
  } catch (error) {
    console.error('Error loading profile:', error);
    const errorMessage = (error as ErrorMessages).response.data.message;
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage ?? 'Failed to load profile',
      life: 3000,
    });
    router.push('/dashboard');
  }
};

const loadUserStats = async () => {
  try {
    const stats = await userService.getUserStats(username.value);
    userStats.value = stats;
  } catch (error) {
    console.error('Error loading user stats:', error);
  }
};

const updatePrivacySettings = async () => {
  loading.value = true;
  try {
    await userService.updatePrivacySettings(privacySettings.value);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Privacy settings updated successfully',
      life: 3000,
    });
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update privacy settings',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProfile();
  loadUserStats();
});

watch(
  () => route.params.username,
  async (newUsername) => {
    username.value = newUsername as string;
    await loadProfile();
    await loadUserStats();
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex">
    <DashboardSidebar />

    <div class="flex-1 p-4">
      <div class="grid">
        <!-- En-tête du profil -->
        <div class="col-12">
          <div class="card">
            <div class="flex align-items-center gap-4">
              <Avatar
                :image="`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`"
                size="xlarge"
                shape="circle"
              />
              <div>
                <h1 class="text-3xl font-bold m-0">{{ username }}</h1>
                <p class="text-600 m-0">
                  Member since
                  {{
                    userProfile?.createdAt
                      ? new Date(userProfile.createdAt).toLocaleDateString()
                      : '-'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Paramètres de confidentialité (visible uniquement sur son propre profil) -->
        <div v-if="isOwnProfile" class="col-12">
          <div class="card">
            <h2 class="text-2xl font-bold mb-4">Privacy Settings</h2>
            <div class="flex flex-column gap-3">
              <div class="flex align-items-center justify-content-between">
                <div>
                  <h3 class="text-lg font-medium m-0">Public Profile</h3>
                  <p class="text-600 m-0">Allow others to view your profile</p>
                </div>
                <InputSwitch v-model="privacySettings.publicProfile" />
              </div>
              <div class="flex align-items-center justify-content-between">
                <div>
                  <h3 class="text-lg font-medium m-0">Game History</h3>
                  <p class="text-600 m-0">Allow others to view your game history</p>
                </div>
                <InputSwitch v-model="privacySettings.showGameHistory" />
              </div>
              <Button
                label="Save Settings"
                @click="updatePrivacySettings"
                :loading="loading"
                severity="primary"
              />
            </div>
          </div>
        </div>

        <div class="col-12 lg:col-4">
          <PlayerStats :username="username" :stats="userStats" />
        </div>

        <div class="col-12 lg:col-8">
          <GameHistoryList
            :username="username"
            :public-view="!isOwnProfile"
            :visible="privacySettings.showGameHistory || isOwnProfile"
          />
        </div>
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
  margin-bottom: 1rem;
}
</style>
