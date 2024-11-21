<template>
    <InputGroup>
        <InputGroupAddon> <i class="pi pi-user"></i></InputGroupAddon>
        <InputText v-model="author.firstName"></InputText>
    </InputGroup>
    <InputGroup>
        <InputGroupAddon> <i class="pi pi-user"></i></InputGroupAddon>
        <InputText v-model="author.lastName"></InputText>
    </InputGroup>

    <Button :label="labelButton" @click="emit('update:author', author)"
        :style="isReset ? 'background-color: red;' : ''"></Button>
</template>

<script setup lang="ts">
import type { AuthorModel } from '@/model/Author.model';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { computed, ref, watch } from 'vue';

const currentAuthor = ref<AuthorModel>({ "id": 1, "firstName": "Georges", "lastName": "Orwell" });
const labelButton = "Reset";


const props = defineProps<{ author: AuthorModel }>();
const emit = defineEmits(['update:author']);

const isReset = computed(() => {
    console.log("Is Reset Computed");
    return currentAuthor.value.id === 1 && currentAuthor.value.lastName === "Orwell";
})


watch(isReset, (newValue, oldValue) => {
    console.log("Watch is reset");
});

function reset() {
    author.value = { "id": 1, "firstName": "George", "lastName": "Orwell" };
}
</script>