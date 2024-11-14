<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { Menubar } from 'primevue';

const router = useRouter();
const item = ref([
    {
        label:'Autheur',
        icon:'pi pi-user',
        command: () => router.push('/authors'),
    }
]);

</script>

<template>
    <Menubar :model="item"></Menubar>
</template>
