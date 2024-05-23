<template>
  <Card :is-open="isUpdateCardOpen" @toggle-card="toggleCard(false)">
    <div class="content">
      <h1 style="margin-bottom: 0.5em">🚀 {{ $t('update.title') }}</h1>

      <div class="features-body" v-if="htmlChangelog != ''" v-html="htmlChangelog"></div>
      <div class="no-features" v-else>{{ $t('update.no-data') }}</div>

      <button class="btn btn--action" ref="confirm-btn" @click="toggleCard(false)">
        {{ $t('update.confirm') }}
      </button>

      <p class="bottom-info">
        {{ $t('update.info-1') }}
        <br />
        <span v-html="$t('update.info-2')"></span>
      </p>
    </div>
  </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';
import { version } from '../../../package.json';
import { Converter } from 'showdown';

import Card from '../Global/Card.vue';

const converter = new Converter();

export default defineComponent({
  components: { Card },

  props: {
    isUpdateCardOpen: {
      type: Boolean,
      required: true
    }
  },

  emits: ['toggleCard'],

  data() {
    return {
      mainStore: useMainStore(),
      version: version
    };
  },

  watch: {
    isUpdateCardOpen(val: boolean) {
      this.$nextTick(() => {
        if (val) (this.$refs['confirm-btn'] as HTMLElement).focus();
      });
    }
  },

  computed: {
    htmlChangelog() {
      if (this.mainStore.appUpdate == null) return '';

      return converter.makeHtml(this.mainStore.appUpdate.changelog);
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
@import '../../styles/variables';

::v-deep(h1) {
  text-align: center;
  color: $accentCol;
}

::v-deep(h2) {
  padding: 0.25em 0;
  border-bottom: 1px solid #aaa;
}

::v-deep(ul) {
  list-style: initial;
  padding: 1em;
  line-height: 1.5em;
}

.content {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.5em;
  padding: 1em;
  min-height: 700px;
  overflow: auto;
  text-align: justify;
  max-width: 700px;
}

.no-features {
  text-align: center;
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
