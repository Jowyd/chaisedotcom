<template>
  <Toast position="top-right" />
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ErrorService } from '@/services/ErrorService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

onMounted(() => {
  ErrorService.init(toast);
});
</script>
