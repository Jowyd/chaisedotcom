<script setup lang="ts">
  import InputText  from 'primevue/inputtext';
  import { DataTable, Column } from 'primevue';

  import { ref } from 'vue';
  import type { AuthorModel } from '@/model/Author.model';
  import AuthorCard from '@/components/AuthorCard.vue';

  const texte = ref("Hello World!");
  const author = ref<AuthorModel>({
    id: 1,
    name: "John",
    lastname:"Doe",
  });

  const authors = ref<AuthorModel[]>([
    {
      id: 1,
      name: "John",
      lastname: "Doe",
    },
    {
      id: 2,
      name: "Jane",
      lastname: "Doe",
    },
    {
      id: 3,
      name: "John",
      lastname: "Smith",
    },
    {
      id: 4,
      name: "Jane",
      lastname: "Smith",
    }
  ]);
  const currentAuthor = ref<AuthorModel>({
    id: 1,
    name: "John",
    lastname: "Doe",
  });

//   function save(event : AuthorModel) {
//     Object.assign(author.value, event);
//     // author.value.name = event.name;
//     // author.value.lastname = event.lastname;
//   }
</script>

<template>
  <!-- <AuthorCard @update:author="save($event)"></AuthorCard>
  {{ author.name }} {{ author.lastname }} -->
  <DataTable :value="authors" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 20]" paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown">
    <Column field="name" header="Prénom" style="width: 33%;"></Column>
    <Column field="lastname" header="Nom" style="width: 33%;"></Column>
    <Column header="Nom complet" style="width: 33%;">
      <template #body="{data}">
        {{ data.name + " " + data.lastname }}
      </template>
    </Column>
  </DataTable>

  <AuthorCard :author="currentAuthor"></AuthorCard>
</template>

