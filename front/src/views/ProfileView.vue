<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import GameHistoryList from '@/components/profile/GameHistoryList.vue';
import PlayerStats from '@/components/profile/PlayerStats.vue';
import { authService } from '@/services/AuthService';
import { userService, type UserProfile } from '@/services/UserService';
import router from '@/router';
import { ErrorService } from '@/services/ErrorService';
import { useErrorHandler } from '@/composables/useErrorHandler';

const { loading, withErrorHandling } = useErrorHandler();
const route = useRoute();
const toast = useToast();
const username = ref(route.params.username as string);
const isOwnProfile = computed(() => authService.getUser()?.username === username.value);

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
  const profile = await withErrorHandling(
    () => userService.getProfile(username.value),
    'Profile Loading',
  );

  if (profile) {
    userProfile.value = profile;
  } else {
    router.push('/dashboard');
  }
};

const loadUserStats = async () => {
  const stats = await withErrorHandling(
    () => userService.getUserStats(username.value),
    'Stats Loading',
  );

  if (stats) {
    userStats.value = stats;
  }
};

const updatePrivacySettings = async () => {
  await withErrorHandling(async () => {
    await userService.updatePrivacySettings(privacySettings.value);
    ErrorService.handleSuccess('Privacy settings updated successfully');
    return true;
  }, 'Privacy Settings Update');
};

onMounted(() => {
  loadProfile();
  loadUserStats();
  ErrorService.init(toast);
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
