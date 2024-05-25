<template>
  <transition name="modal-anim" tag="div">
    <div class="card" v-if="isOpen">
      <div class="card-background" @click="toggleCard(false)"></div>
      <div class="card-body" tabindex="0">
        <slot></slot>
      </div>
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
  height: 100%;
  z-index: 200;

  display: flex;
  justify-content: center;
  align-items: center;
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
  position: relative;

  margin: 1em;

  max-height: 90vh;
  max-height: 95dvh;

  background-color: #1a1a1a;
  box-shadow: 0 0 15px 10px #0e0e0e;

  overflow: auto;
}

@include smallScreen {
  .card {
    align-items: flex-start;
  }
}
</style>
