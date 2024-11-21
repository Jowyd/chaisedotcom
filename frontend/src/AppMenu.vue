<template>
    <Menubar :model="items"></Menubar>
</template>

<script setup lang="ts">
import { Menubar } from 'primevue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const items = ref([
    {
        label: 'Auteur',
        icon: 'pi pi-user',
        command: () => router.push('/authors')
    }
]);
</script>