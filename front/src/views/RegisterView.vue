<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';

const router = useRouter();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const acceptTerms = ref(false);

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
          />
        </div>

        <div class="flex align-items-center gap-2">
          <Checkbox id="acceptTerms" v-model="acceptTerms" :binary="true" />
          <label for="acceptTerms" class="text-sm">
            I agree to the
            <a href="#" class="text-primary no-underline hover:underline">Terms of Service</a>
            and
            <a href="#" class="text-primary no-underline hover:underline">Privacy Policy</a>
          </label>
        </div>

        <Button label="Create Account" severity="primary" class="w-full" />

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
