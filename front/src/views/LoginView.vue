<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { authService } from '@/services/AuthService';
import { useToast } from 'primevue/usetoast';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const username = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) return;

  loading.value = true;
  try {
    await authService.login({
      username: username.value,
      password: password.value,
    });
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Login successful',
      life: 3000,
    });

    const redirectPath = route.query.redirect as string || '/dashboard';
    router.push(redirectPath);
  } catch (error) {
    console.error(error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Login failed. Please check your credentials.',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen">
    <div class="surface-card p-4 shadow-2 border-round w-full lg:w-4">
      <h2 class="text-center mb-4">Login</h2>
      <div class="flex flex-column gap-3">
        <InputText v-model="username" placeholder="Username" :disabled="loading" />
        <Password
          v-model="password"
          placeholder="Password"
          :feedback="false"
          :disabled="loading"
          @keyup.enter="handleLogin"
          toggleMask
        />
        <Button label="Login" @click="handleLogin" :loading="loading" severity="primary" />
        <div class="text-center">
          <router-link to="/register" class="text-primary">Create account</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-password input) {
  width: 100%;
}
</style>
