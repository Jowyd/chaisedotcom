<script setup lang="ts">
import { ref } from 'vue';
import DashboardSidebar from '@/components/DashboardSidebar.vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Divider from 'primevue/divider';
import Button from 'primevue/button';

const toast = useToast();
const loading = ref(false);

// Paramètres du profil
const username = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const updateProfile = async () => {
  loading.value = true;
  try {
    // Appel API pour mettre à jour le profil
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Profile updated successfully',
      life: 3000,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update profile',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const updatePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Passwords do not match',
      life: 3000,
    });
    return;
  }

  loading.value = true;
  try {
    // Appel API pour changer le mot de passe
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Password updated successfully',
      life: 3000,
    });
  } catch (error) {
    console.error('Error updating password:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update password',
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
        <!-- Profile Settings -->
        <div class="col-12 lg:col-6">
          <div class="card">
            <h2 class="text-2xl font-bold mb-4">Profile Settings</h2>
            <div class="flex flex-column gap-3">
              <div class="flex flex-column gap-2">
                <label for="username" class="font-medium">Username</label>
                <InputText id="username" v-model="username" :disabled="loading" />
              </div>

              <Button
                label="Update Profile"
                severity="primary"
                :loading="loading"
                @click="updateProfile"
              />
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
                />
              </div>

              <div class="flex flex-column gap-2">
                <label for="newPassword" class="font-medium">New Password</label>
                <Password id="newPassword" v-model="newPassword" toggleMask :disabled="loading" />
              </div>

              <div class="flex flex-column gap-2">
                <label for="confirmPassword" class="font-medium">Confirm Password</label>
                <Password
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :feedback="false"
                  toggleMask
                  :disabled="loading"
                />
              </div>

              <Button
                label="Change Password"
                severity="primary"
                :loading="loading"
                @click="updatePassword"
              />
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
</style>
