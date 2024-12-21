<script setup lang="ts">
import { ref, computed } from 'vue';

interface GameCreationDetails {
  opponent: string;
  colorAssignment: 'random' | 'fixed';
  playerColor?: 'white' | 'black';
}

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'create-game': [GameCreationDetails];
}>();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

const opponent = ref('');
const colorAssignment = ref<'random' | 'fixed'>('random');
const playerColor = ref<'white' | 'black'>('white');

const createGame = () => {
  if (opponent.value) {
    const gameDetails: GameCreationDetails = {
      opponent: opponent.value,
      colorAssignment: colorAssignment.value,
      ...(colorAssignment.value === 'fixed' && { playerColor: playerColor.value }),
    };

    emit('create-game', gameDetails);
    resetForm();
    dialogVisible.value = false;
  }
};

const resetForm = () => {
  opponent.value = '';
  colorAssignment.value = 'random';
  playerColor.value = 'white';
};

const closeDialog = () => {
  resetForm();
  dialogVisible.value = false;
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
        <label class="font-medium">Color Assignment</label>
        <div class="flex gap-4">
          <div class="flex align-items-center gap-2">
            <RadioButton v-model="colorAssignment" value="random" inputId="random" />
            <label for="random">Random</label>
          </div>
          <div class="flex align-items-center gap-2">
            <RadioButton v-model="colorAssignment" value="fixed" inputId="fixed" />
            <label for="fixed">Choose Color</label>
          </div>
        </div>
      </div>

      <div v-if="colorAssignment === 'fixed'" class="flex flex-column gap-2">
        <label class="font-medium">{{ opponent }}'s Color</label>
        <div class="flex gap-4">
          <div class="flex align-items-center gap-2">
            <RadioButton v-model="playerColor" value="white" inputId="white" />
            <label for="white">White</label>
          </div>
          <div class="flex align-items-center gap-2">
            <RadioButton v-model="playerColor" value="black" inputId="black" />
            <label for="black">Black</label>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button label="Cancel" severity="secondary" text @click="closeDialog" />
        <Button label="Create Game" severity="primary" @click="createGame" :disabled="!opponent" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.color-option {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color 0.2s;
}

.color-option:hover {
  background: var(--surface-hover);
}

.color-option.selected {
  background: var(--primary-color);
  color: var(--primary-color-text);
}
</style>
