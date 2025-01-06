<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useErrorHandler } from '@/composables/useErrorHandler';
import { ErrorService } from '@/services/ErrorService';
import { ValidationService } from '@/services/ValidationService';
import { userService } from '@/services/UserService';
import { authService } from '@/services/AuthService';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const { loading, withErrorHandling } = useErrorHandler();

const username = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

onMounted(() => {
  ErrorService.init(toast);
  const user = authService.getUser();
  if (user) {
    username.value = user.username;
  }
});

const validateProfileUpdate = (): boolean => {
  const validationErrors = ValidationService.validateProfileUpdate({
    username: username.value,
  });

  if (validationErrors.length > 0) {
    ErrorService.handleFormValidationErrors(validationErrors);
    return false;
  }

  return true;
};

const validatePasswordUpdate = (): boolean => {
  const validationErrors = ValidationService.validatePasswordUpdate({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
    confirmPassword: confirmPassword.value,
  });

  if (validationErrors.length > 0) {
    ErrorService.handleFormValidationErrors(validationErrors);
    return false;
  }

  return true;
};

const updateProfile = async () => {
  if (!validateProfileUpdate()) return;

  await withErrorHandling(async () => {
    await userService.updateUsername(username.value);
    ErrorService.handleSuccess('Username updated successfully');
    return true;
  }, 'Profile Update');
};

const updatePassword = async () => {
  if (!validatePasswordUpdate()) return;

  await withErrorHandling(async () => {
    await userService.updatePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });

    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';

    ErrorService.handleSuccess('Password updated successfully');
    return true;
  }, 'Password Update');
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
            <form @submit.prevent="updateProfile" class="flex flex-column gap-3">
              <div class="flex flex-column gap-2">
                <label for="username" class="font-medium">Username</label>
                <div class="p-inputgroup">
                  <InputText
                    id="username"
                    v-model="username"
                    :disabled="loading"
                    placeholder="Enter your username"
                  />
                  <Button type="submit" icon="pi pi-check" severity="primary" :loading="loading" />
                </div>
              </div>
            </form>

            <Divider />

            <h3 class="text-xl font-bold mb-4">Change Password</h3>
            <form @submit.prevent="updatePassword" class="flex flex-column gap-3">
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
                type="submit"
                label="Change Password"
                severity="primary"
                :loading="loading"
                class="align-self-end"
              />
            </form>
          </div>
        </div>

        <div class="col-12 lg:col-6">
          <div class="card">
            <h2 class="text-2xl font-bold mb-4">Account Information</h2>
            <div class="flex flex-column gap-3">
              <div
                class="flex justify-content-between align-items-center p-3 surface-ground border-round"
              >
                <div>
                  <h3 class="text-lg font-medium m-0">Account Status</h3>
                  <p class="text-600 m-0">Your account is active</p>
                </div>
                <i class="pi pi-check-circle text-xl text-green-500"></i>
              </div>

              <div
                class="flex justify-content-between align-items-center p-3 surface-ground border-round"
              >
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
