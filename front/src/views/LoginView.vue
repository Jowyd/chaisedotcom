<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

const router = useRouter();
const email = ref('');
const password = ref('');
const rememberMe = ref(false);

const navigateToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="flex align-items-center justify-content-center min-h-screen surface-ground">
    <div class="surface-card p-6 shadow-2 border-round-xl w-full md:w-6 lg:w-4">
      <div class="text-center mb-5">
        <div class="text-3xl font-bold mb-3">Welcome Back</div>
        <span class="text-600 font-medium">Sign in to continue</span>
      </div>

      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="email" class="font-medium">Email</label>
          <InputText
            id="email"
            type="email"
            v-model="email"
            placeholder="Enter your email"
            class="w-full"
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
          />
        </div>

        <div class="flex align-items-center justify-content-between">
          <div class="flex align-items-center gap-2">
            <Checkbox id="rememberMe" v-model="rememberMe" :binary="true" />
            <label for="rememberMe">Remember me</label>
          </div>
          <a class="text-primary font-medium no-underline hover:underline cursor-pointer">
            Forgot password?
          </a>
        </div>

        <Button label="Sign In" severity="primary" class="w-full" />

        <div class="text-center">
          <span class="text-600">Don't have an account? </span>
          <a
            @click="navigateToRegister"
            class="text-primary font-medium no-underline hover:underline cursor-pointer"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
