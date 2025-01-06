<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useErrorHandler } from '@/composables/useErrorHandler';
import { ErrorService } from '@/services/ErrorService';
import { ValidationService } from '@/services/ValidationService';
import { authService } from '@/services/AuthService';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

const router = useRouter();
const { loading, withErrorHandling } = useErrorHandler();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptTerms = ref(false);

const validateForm = (): boolean => {
  const validationErrors = ValidationService.validateRegisterForm({
    username: username.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    acceptTerms: acceptTerms.value,
  });

  if (validationErrors.length > 0) {
    ErrorService.handleFormValidationErrors(validationErrors);
    return false;
  }

  return true;
};

const handleRegister = async () => {
  if (!validateForm()) return;

  await withErrorHandling(async () => {
    await authService.register({
      username: username.value,
      password: password.value,
    });

    ErrorService.handleSuccess('Registration successful');
    router.push('/dashboard');
    return true;
  }, 'Registration');
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

      <form @submit.prevent="handleRegister" class="flex flex-column gap-4">
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
          type="submit"
          label="Create Account"
          severity="primary"
          class="w-full"
          :loading="loading"
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
      </form>
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
