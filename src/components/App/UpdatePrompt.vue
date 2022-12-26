<template>
  <div class="update-prompt">
    <transition name="prompt-anim">
      <div class="prompt_content" v-if="!hidePrompt && needRefresh">
        <div>Nowa wersja <span class="text--primary">Stacjownika</span> jest dostępna!</div>

        <div class="prompt_actions">
          <button class="btn btn--filled" @click="updateServiceWorker(true)">ZAKTUALIZUJ</button>
          <button class="btn btn--filled" @click="hidePrompt = true">PÓŹNIEJ</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import useCustomSW from '../../mixins/useCustomSW';

const hidePrompt = ref(false);
const { needRefresh, updateServiceWorker } = useCustomSW();
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.update-prompt {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 200;
}

.prompt_content {
  margin: 1em;
  padding: 1em;

  font-weight: bold;
  background-color: black;

  box-shadow: 0 0 10px 1px $accentCol;
  border-radius: 1em;
}

.prompt_actions {
  display: flex;
  margin-top: 1em;
  gap: 0.5em;

  button {
    width: 100%;
  }
}

// Animation
.prompt-anim {
  &-enter-active,
  &-leave-active {
    transition: all 120ms ease-in;
    transform: translateY(0);
  }

  &-enter-from,
  &-leave-to {
    transform: translateY(100%);
  }
}
</style>

