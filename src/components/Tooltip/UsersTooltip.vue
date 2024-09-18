<template>
  <div class="tooltip-content" v-if="trains.length != 0">
    <span v-for="(train, i) in trains">
      <template v-if="i > 0"> | </template>
      <b>{{ train.trainNo }}</b> {{ train.driverName }}
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useTooltipStore } from '../../store/tooltipStore';
import { Train } from '../../typings/common';

export default defineComponent({
  data() {
    return {
      tooltipStore: useTooltipStore()
    };
  },

  computed: {
    trains() {
      if (this.tooltipStore.content == '') return [];

      const parsedTrains = JSON.parse(this.tooltipStore.content) as Train[];
      return (parsedTrains ?? []).sort((a, b) => a.trainNo - b.trainNo);
    }
  }
});
</script>

<style scoped>
.tooltip-content {
  width: 200px;

  padding: 0.25em 0.5em;
  border-radius: 0.25em;

  background-color: #1b1b1b;
  box-shadow: 0 0 5px 2px #aaa;
}
</style>
