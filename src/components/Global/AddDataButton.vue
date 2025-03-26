<template>
  <button
    class="btn btn--option btn--load-data"
    v-if="!scrollNoMoreData && scrollDataLoaded && list.length >= 15"
    @click="addHistoryData"
  >
    {{ $t('journal.load-data') }}
  </button>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

export default defineComponent({
  props: {
    scrollNoMoreData: {
      type: Boolean,
      required: true
    },

    scrollDataLoaded: {
      type: Boolean,
      required: true
    },

    list: {
      type: Array as PropType<any[]>,
      required: true
    }
  },

  emits: ['addHistoryData'],

  methods: {
    addHistoryData() {
      this.$emit('addHistoryData');
    }
  }
});
</script>
