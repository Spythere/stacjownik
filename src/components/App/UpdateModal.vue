<template>
  <AnimatedModal :is-open="updateModalOpen" @toggle-modal="toggleModal">
    <div class="modal_content">
      <div>
        <h1 style="margin-bottom: 0.5em">{{ $t('update.title') }}</h1>
      </div>

      <div class="features-body" v-html="htmlChangelog"></div>

      <div class="modal_actions">
        <button class="btn--action" @click="toggleModal">Przyjąłem!</button>

        <p>Ten changelog będzie zawsze dostępny po kliknięciu numeru wersji w stopce strony!</p>

        <!-- <div class="actions-checkboxes">
          <label>
            <input type="checkbox" />
            <span>nie pokazuj dla przyszłych aktualizacji</span>
          </label>

          <label>
            <input type="checkbox" />
            <span>nie pokazuj dla przyszłych aktualizacji</span>
          </label>
        </div> -->
      </div>
    </div>
  </AnimatedModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';
import { version } from '../../../package.json';
import { Converter } from 'showdown';

import AnimatedModal from '../Global/AnimatedModal.vue';

const converter = new Converter();

export default defineComponent({
  components: { AnimatedModal },

  props: {
    updateModalOpen: {
      type: Boolean,
      required: true
    }
  },

  emits: ['toggleModal'],

  data() {
    return {
      mainStore: useMainStore(),
      version: version
    };
  },

  computed: {
    htmlChangelog() {
      if (this.mainStore.appUpdate == null) return '';

      const x = converter.makeHtml(this.mainStore.appUpdate.changelog);
      console.log(x);

      return x;
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
::v-deep h1 {
  text-align: center;
}

::v-deep h2 {
  padding: 0.25em 0;
}

::v-deep ul {
  list-style: inside;
  padding: 0.5em;
  line-height: 1.5em;
}

.modal_content {
  padding: 2em;
  height: 80vh;
  min-height: 550px;

  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.5em;
}

hr.separator {
  margin: 0.5em 0;
  padding: 0;
  height: 3px;
  background-color: #fff;
}

.modal_actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}
</style>
