<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import { useToast } from 'primevue/usetoast';
import { userService } from '@/services/UserService';
import { authService } from '@/services/AuthService';

const toast = useToast();
const loading = ref(false);

const username = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

onMounted(() => {
  const user = authService.getUser();
  if (user) {
    username.value = user.username;
  }
});

const updateProfile = async () => {
  if (!username.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Username cannot be empty',
      life: 3000,
    });
    return;
  }

  loading.value = true;
  try {
    await userService.updateUsername(username.value);
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Username updated successfully',
      life: 3000,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to update username',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const updatePassword = async () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'All password fields are required',
      life: 3000,
    });
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'New passwords do not match',
      life: 3000,
    });
    return;
  }

  loading.value = true;
  try {
    await userService.updatePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });

    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Password updated successfully',
      life: 3000,
    });
  } catch (error: any) {
    console.error('Error updating password:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Failed to update password',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex">
    <DashboardSidebar />

    <div class="flex-1 p-4">
      <div class="grid">
        <div class="col-12 lg:col-6">
          <div class="card">
            <h2 class="text-2xl font-bold mb-4">Profile Settings</h2>
            <div class="flex flex-column gap-3">
              <div class="flex flex-column gap-2">
                <label for="username" class="font-medium">Username</label>
                <div class="p-inputgroup">
                  <InputText 
                    id="username" 
                    v-model="username" 
                    :disabled="loading" 
                    placeholder="Enter your username"
                  />
                  <Button 
                    icon="pi pi-check" 
                    severity="primary"
                    :loading="loading"
                    @click="updateProfile"
                  />
                </div>
              </div>
            </div>

            <Divider />

            <h3 class="text-xl font-bold mb-4">Change Password</h3>
            <div class="flex flex-column gap-3">
              <div class="flex flex-column gap-2">
                <label for="currentPassword" class="font-medium">Current Password</label>
                <Password
                  id="currentPassword"
                  v-model="currentPassword"
                  :feedback="false"
                  toggleMask
                  :disabled="loading"
                  placeholder="Enter your current password"
                />
              </div>

              <div class="flex flex-column gap-2">
                <label for="newPassword" class="font-medium">New Password</label>
                <Password 
                  id="newPassword" 
                  v-model="newPassword" 
                  toggleMask 
                  :disabled="loading"
                  placeholder="Enter your new password"
                />
              </div>

              <div class="flex flex-column gap-2">
                <label for="confirmPassword" class="font-medium">Confirm Password</label>
                <Password
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :feedback="false"
                  toggleMask
                  :disabled="loading"
                  placeholder="Confirm your new password"
                />
              </div>

              <Button
                label="Change Password"
                severity="primary"
                :loading="loading"
                @click="updatePassword"
                class="align-self-end"
              />
            </div>
          </div>
        </div>

        <div class="col-12 lg:col-6">
          <div class="card">
            <h2 class="text-2xl font-bold mb-4">Account Information</h2>
            <div class="flex flex-column gap-3">
              <div class="flex justify-content-between align-items-center p-3 surface-ground border-round">
                <div>
                  <h3 class="text-lg font-medium m-0">Account Status</h3>
                  <p class="text-600 m-0">Your account is active</p>
                </div>
                <i class="pi pi-check-circle text-xl text-green-500"></i>
              </div>

              <div class="flex justify-content-between align-items-center p-3 surface-ground border-round">
                <div>
                  <h3 class="text-lg font-medium m-0">Last Login</h3>
                  <p class="text-600 m-0">{{ new Date().toLocaleDateString() }}</p>
                </div>
                <i class="pi pi-clock text-xl text-primary"></i>
              </div>
            </div>
          </div>
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

:deep(.p-password input) {
  width: 100%;
}

:deep(.p-inputtext) {
  width: 100%;
}

.p-inputgroup {
  display: flex;
  align-items: stretch;
}

.p-inputgroup .p-inputtext {
  flex: 1 1 auto;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.p-inputgroup .p-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
