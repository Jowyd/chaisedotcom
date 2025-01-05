<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { authService } from '@/services/AuthService';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

const router = useRouter();
const toast = useToast();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptTerms = ref(false);
const loading = ref(false);

const validateForm = (): boolean => {
  if (!username.value || !password.value || !confirmPassword.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please fill in all fields',
      life: 3000,
    });
    return false;
  }

  if (password.value !== confirmPassword.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Passwords do not match',
      life: 3000,
    });
    return false;
  }

  if (!acceptTerms.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Please accept the terms and conditions',
      life: 3000,
    });
    return false;
  }

  return true;
};

const handleRegister = async () => {
  if (!validateForm()) return;

  loading.value = true;
  try {
    await authService.register({
      username: username.value,
      password: password.value,
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Registration successful',
      life: 3000,
    });

    router.push('/dashboard');
  } catch (error) {
    console.info('Error registering:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Registration failed. Please try again.',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const navigateToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen surface-ground">
    <div class="surface-card p-6 shadow-2 border-round-xl w-full md:w-6 lg:w-4">
      <div class="text-center mb-5">
        <div class="text-3xl font-bold mb-3">Create Account</div>
        <span class="text-600 font-medium">Join our chess community</span>
      </div>

      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="username" class="font-medium">Username</label>
          <InputText
            id="username"
            v-model="username"
            placeholder="Choose a username"
            class="w-full"
            :disabled="loading"
          />
        </div>

        <div class="flex flex-column gap-2">
          <label for="password" class="font-medium">Password</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Create a password"
            toggleMask
            class="w-full"
            :disabled="loading"
          />
        </div>

        <div class="flex flex-column gap-2">
          <label for="confirmPassword" class="font-medium">Confirm Password</label>
          <Password
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm your password"
            :feedback="false"
            toggleMask
            class="w-full"
            :disabled="loading"
            @keyup.enter="handleRegister"
          />
        </div>

        <div class="flex align-items-center gap-2">
          <Checkbox id="acceptTerms" v-model="acceptTerms" :binary="true" :disabled="loading" />
          <label for="acceptTerms" class="text-sm">
            I agree to the
            <a href="#" class="text-primary no-underline hover:underline">Terms of Service</a>
            and
            <a href="#" class="text-primary no-underline hover:underline">Privacy Policy</a>
          </label>
        </div>

        <Button
          label="Create Account"
          severity="primary"
          class="w-full"
          :loading="loading"
          @click="handleRegister"
        />

        <div class="text-center">
          <span class="text-600">Already have an account? </span>
          <a
            @click="navigateToLogin"
            class="text-primary font-medium no-underline hover:underline cursor-pointer"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-password input) {
  width: 100%;
}

:deep(.p-password-meter) {
  margin-top: 0.5rem;
}
</style>
