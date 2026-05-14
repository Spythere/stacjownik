<template>
  <div class="scenery-actions">
    <button class="btn--filled btn--image" @click="onReturnButtonClick">
      <img src="/images/icon-back.svg" alt="return icon" />
      <span>
        {{ $t('scenery.return-btn') }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function onReturnButtonClick() {
  router.back();
}
</script>

<style lang="scss" scoped>
.scenery-actions {
  display: flex;

  position: sticky;
  top: 0;

  padding: 0.25em;
  background-color: var(--clr-tile);

  button {
    padding: 0.5em;
  }
}
</style>
