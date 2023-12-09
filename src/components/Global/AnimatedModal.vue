<template>
  <transition name="modal-anim" tag="div" class="modal">
    <div class="body" v-if="isOpen">
      <div class="background" @click="toggleModal(false)"></div>
      <div class="wrapper" ref="wrapper" tabindex="0">
        <slot></slot>
      </div>
      <div class="tab-exit" ref="exit" tabindex="0" @focus="toggleModal(false)"></div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';

export default defineComponent({
  emits: ['toggleModal'],

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
        if (v) (this.$refs['wrapper'] as HTMLElement).focus();
        else (this.store.modalLastClickedTarget as HTMLElement)?.focus();
      });
    }
  },

  methods: {
    toggleModal(value: boolean) {
      this.$emit('toggleModal', value);
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.body {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;

  width: 100vw;
  height: 100vh;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  cursor: pointer;

  background-color: rgba(0, 0, 0, 0.55);
}

.wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  background-color: #1a1a1a;
  box-shadow: 0 0 15px 10px #333333;

  width: 95%;
  max-width: 800px;
  max-height: 95vh;

  & > :slotted(div) {
    max-height: 95vh;
  }
}

@include smallScreen {
  .wrapper {
    top: 0;
    transform: translate(-50%, 1em);
    max-height: 90vh;

    & > :slotted(div) {
      max-height: 90vh;
    }
  }
}
</style>
