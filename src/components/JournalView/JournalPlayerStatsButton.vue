<template>
  <button
    class="btn--filled btn--image"
    @click="onClick()"
    :disabled="playerId == -1"
    :data-disabled="playerId == -1"
  >
    <img src="/images/icon-user.svg" alt="player icon" />
    {{ $t('journal.driver-stats.button') }}
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  playerId: {
    type: Number,
    required: true
  }
});

function onClick() {
  console.log('test 123', props.playerId);
}
</script>

<style scoped></style>
