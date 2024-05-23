<template>
  <transition name="modal-anim" tag="div">
    <div class="card" v-if="isOpen">
      <div class="card-background" @click="toggleCard(false)"></div>
      <div class="card-body" ref="wrapper" tabindex="0">
        <slot></slot>
      </div>
      <div class="tab-exit" ref="exit" tabindex="0" @focus="toggleCard(false)"></div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';

export default defineComponent({
  emits: ['toggleCard'],

  props: {
    isOpen: Boolean
  },

  data() {
    return {
      store: useMainStore()
    };
  },

  watch: {
    isOpen(v) {
      this.$nextTick(() => {
        if (v == false) (this.store.modalLastClickedTarget as HTMLElement)?.focus();
      });
    }
  },

  methods: {
    toggleCard(value: boolean) {
      this.$emit('toggleCard', value);
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.card {
  position: fixed;
  top: 0;
  left: 0;

  width: 100%;
  height: 100vh;
  z-index: 200;
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  cursor: pointer;

  background-color: rgba(0, 0, 0, 0.55);
}

.card-body {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 210;
  overflow: auto;
  max-height: 95vh;

  box-shadow: 0 0 15px 10px #0e0e0e;

  & > :slotted(div) {
    background-color: #1a1a1a;
    width: 95vw;
  }
}
</style>
