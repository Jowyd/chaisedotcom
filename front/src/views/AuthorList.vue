<template>
    <DataTable :value="authors" paginator :rows=5 @row-click="displayAuthorCard($event)">
        <Column field="firstName" header="Prénom" class="column"></Column>
        <Column header="Nom" style="width: 33%">
            <template #body="{ data }">
                {{ data.lastName }}
            </template>
        </Column>
        <Column header="Nom complet" style="width: 33%">
            <template #body="{ data }">
                {{ data.firstName + " " + data.lastName }}
            </template>
        </Column>
    </DataTable>

    <AuthorCard :author="currentAuthor"></AuthorCard>
</template>

<script setup lang="ts">
import { DataTable, Column, type DataTableRowClickEvent } from 'primevue';
import AuthorCard from '@/components/AuthorCard.vue';
import { ref } from 'vue';
import type { AuthorModel } from '@/model/Author.model';

const authors = ref<AuthorModel[]>([
    { id: 1, firstName: "Georges", lastName: "Orwell" },
    { id: 2, firstName: "Jane", lastName: "Austen" },
    { id: 3, firstName: "Mark", lastName: "Twain" },
    { id: 4, firstName: "Virginia", lastName: "Woolf" },
    { id: 5, firstName: "Homer", lastName: "Simpson" },
    { id: 6, firstName: "Fyodor", lastName: "Dostoevsky" },
    { id: 7, firstName: "Leo", lastName: "Tolstoy" },
    { id: 8, firstName: "Mary", lastName: "Shelley" },
    { id: 9, firstName: "Franz", lastName: "Kafka" },
    { id: 10, firstName: "Gabriel", lastName: "Garcia Marquez" }
]);
const currentAuthor = ref<AuthorModel>({ "id": 0, "firstName": "", "lastName": "" });

function displayAuthorCard(event: DataTableRowClickEvent) {
    Object.assign(currentAuthor.value, event.data);
}
</script>

<style scoped>
.column {
    width: 33%;
}
</style>