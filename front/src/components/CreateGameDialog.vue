<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'create-game': [{ opponent: string; timeControl: string }];
}>();

// Utilisez computed au lieu de ref et watch pour la visibilité
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const opponent = ref('');
const timeControl = ref('');

const timeControls = [
  { name: 'Bullet (1 min)', value: '1+0' },
  { name: 'Bullet (1|1)', value: '1+1' },
  { name: 'Blitz (3 min)', value: '3+0' },
  { name: 'Blitz (3|2)', value: '3+2' },
  { name: 'Blitz (5 min)', value: '5+0' },
  { name: 'Rapid (10 min)', value: '10+0' },
  { name: 'Rapid (15|10)', value: '15+10' },
  { name: 'Classical (30 min)', value: '30+0' },
];

const createGame = () => {
  if (opponent.value && timeControl.value) {
    emit('create-game', {
      opponent: opponent.value,
      timeControl: timeControl.value,
    });
    opponent.value = '';
    timeControl.value = '';
    dialogVisible.value = false; // Update local state
  }
};

const closeDialog = () => {
  opponent.value = '';
  timeControl.value = '';
  dialogVisible.value = false; // Update local state
};
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    header="Create New Game"
    :style="{ width: '90%', maxWidth: '500px' }"
    :closable="true"
    @hide="closeDialog"
  >
    <div class="flex flex-column gap-4">
      <div class="flex flex-column gap-2">
        <label for="opponent" class="font-medium">Opponent Username</label>
        <InputText id="opponent" v-model="opponent" placeholder="Enter opponent's username" />
      </div>

      <div class="flex flex-column gap-2">
        <label for="timeControl" class="font-medium">Time Control</label>
        <Dropdown
          id="timeControl"
          v-model="timeControl"
          :options="timeControls"
          optionLabel="name"
          optionValue="value"
          placeholder="Select time control"
          class="w-full"
        />
      </div>

      <small class="text-600">
        Time controls are shown as: minutes + seconds increment per move
      </small>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Cancel" severity="secondary" text @click="closeDialog" />
        <Button
          label="Create Game"
          severity="primary"
          @click="createGame"
          :disabled="!opponent || !timeControl"
        />
      </div>
    </template>
  </Dialog>
</template>
