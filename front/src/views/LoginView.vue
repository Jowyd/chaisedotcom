<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useErrorHandler } from '@/composables/useErrorHandler';
import { ErrorService } from '@/services/ErrorService';
import { authService } from '@/services/AuthService';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { loading, withErrorHandling } = useErrorHandler();

onMounted(() => {
  ErrorService.init(toast);
});

const username = ref('');
const password = ref('');

const validateForm = (): boolean => {
  const validationErrors = [];

  if (!username.value.trim()) {
    validationErrors.push({
      field: 'username',
      code: 'REQUIRED',
      message: 'Username is required',
    });
  }

  if (!password.value) {
    validationErrors.push({
      field: 'password',
      code: 'REQUIRED',
      message: 'Password is required',
    });
  }

  if (validationErrors.length > 0) {
    ErrorService.handleFormValidationErrors(validationErrors);
    return false;
  }

  return true;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  await withErrorHandling(async () => {
    await authService.login({
      username: username.value,
      password: password.value,
    });

    ErrorService.handleSuccess('Login successful');
    const redirectPath = (route.query.redirect as string) || '/dashboard';
    router.push(redirectPath);
    return true;
  }, 'Login');
};

const navigateToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen surface-ground">
    <div class="surface-card p-6 shadow-2 border-round-xl w-full md:w-6 lg:w-4">
      <div class="text-center mb-5">
        <div class="text-3xl font-bold mb-3">Welcome Back</div>
        <span class="text-600 font-medium">Sign in to your account</span>
      </div>

      <form @submit.prevent="handleLogin" class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="username" class="font-medium">Username</label>
          <InputText
            id="username"
            v-model="username"
            placeholder="Enter your username"
            class="w-full"
            :disabled="loading"
            autocomplete="username"
          />
        </div>

        <div class="flex flex-column gap-2">
          <label for="password" class="font-medium">Password</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Enter your password"
            :feedback="false"
            toggleMask
            class="w-full"
            :disabled="loading"
            autocomplete="current-password"
          />
        </div>

        <Button
          type="submit"
          label="Sign In"
          severity="primary"
          class="w-full"
          :loading="loading"
        />

        <div class="text-center">
          <span class="text-600">Don't have an account? </span>
          <a
            @click="navigateToRegister"
            class="text-primary font-medium no-underline hover:underline cursor-pointer"
          >
            Create one
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-password input) {
  width: 100%;
}
</style>
