<template>
  <AnimatedModal :is-open="mainStore.isNewUpdate" @toggle-modal="toggleModal">
    <div class="modal_content">
      <h1 class="header">Aktualizacja Stacjownika</h1>
      <h2>wersja {{ version }}</h2>

      <b>Co nowego?</b>
      <p>
         <ul>
            <li>test</li>
         </ul>
      </p>
    </div>
  </AnimatedModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';
import { version } from '../../../package.json';
import AnimatedModal from '../Global/AnimatedModal.vue';

export default defineComponent({
  components: { AnimatedModal },

  data() {
    return {
      mainStore: useMainStore(),
      version: version
    };
  },

  methods: {
    toggleModal(value: boolean) {
      this.$emit('toggleModal', value);
    }
  }
});
</script>

<style lang="scss" scoped>
.modal_content {
  text-align: center;
  padding: 1em;
  height: 80vh;
  min-height: 550px;
}
</style>
