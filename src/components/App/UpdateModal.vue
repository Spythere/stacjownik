<template>
  <AnimatedModal :is-open="updateModalOpen" @toggle-modal="toggleModal(false)">
    <div class="modal-content">
      <h1 style="margin-bottom: 0.5em">🚀 {{ $t('update.title') }}</h1>

      <div class="features-body" v-html="htmlChangelog"></div>

      <button class="btn btn--action" ref="confirm-btn" @click="toggleModal(false)">
        {{ $t('update.confirm') }}
      </button>

      <p class="bottom-info">
        {{ $t('update.info-1') }}
        <br />
        <span v-html="$t('update.info-2')"></span>
      </p>
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

  watch: {
    updateModalOpen(val: boolean) {
      this.$nextTick(() => {
        if (val) (this.$refs['confirm-btn'] as HTMLElement).focus();
      });
    }
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
::v-deep(h1) {
  text-align: center;
}

::v-deep(h2) {
  padding: 0.25em 0;
}

::v-deep(ul) {
  list-style: inside;
  padding: 0.5em;
  line-height: 1.5em;
}

.modal-content {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.5em;
  padding: 1em 2em;
  min-height: 700px;
  overflow: auto;
}

hr.separator {
  margin: 0.5em 0;
  padding: 0;
  height: 3px;
  background-color: #fff;
}

button {
  margin: 0 auto;
  padding: 0.5em 0.75em;
  font-size: 1.1em;
}

p.bottom-info {
  text-align: center;
  color: #ccc;
}

a {
  text-decoration: underline;
}
</style>
