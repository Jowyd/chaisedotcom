<script setup lang="ts">
import { InputText, InputGroup, InputGroupAddon, Button } from 'primevue';
import type { AuthorModel } from '@/model/Author.model';
import { computed, defineProps, ref, watch } from 'vue';

//const props = defineProps<{author:AuthorModel}>();
//const author = defineModel<AuthorModel>('author', {required:true});
const currentAuthor = ref<AuthorModel>({
    id: 1,
    name: "John",
    lastname: "Doe",
});

const lastname = defineModel<string>("lastname");
const labelButton = "Clear";

const defaultAuthor = {
        id: 1,
        name: "John",
        lastname: "Doe",
};

const isReset = computed(() => {
    return currentAuthor.value.name === defaultAuthor.name && currentAuthor.value.lastname === defaultAuthor.lastname;
});

const props = defineProps<{author: AuthorModel}>();
const emit = defineEmits(["update:author"]);


watch(isReset, (newValue, oldValue) => {
    console.log(newValue, oldValue);
});

function reset() {
    currentAuthor.value = {...defaultAuthor};
}

</script>

<template>
    <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-user"></i>
        </InputGroupAddon>
        <InputText v-model="author.name" />
    </InputGroup>

    <InputGroup>
        <InputGroupAddon>
            <i class="pi pi-user"></i>
        </InputGroupAddon>
        <InputText v-model="author.lastname" />
    </InputGroup>

    {{ author.name }} {{ author.lastname }}

    <Button :label="labelButton" @click="emit('update:author',author)" :style="isReset ? 'background-color: red;':'' "></Button>
</template>