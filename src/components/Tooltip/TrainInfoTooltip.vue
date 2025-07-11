<template>
  <div class="tooltip-content">
    <span v-if="trainInfoObj">
      {{ trainInfoObj.driverName }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTooltipStore } from '../../store/tooltipStore';
import { Train } from '../../typings/common';

const tooltipStore = useTooltipStore();

const trainInfoObj = computed(() => {
  if (tooltipStore.content == '') return null;

  try {
    return (JSON.parse(tooltipStore.content) as Train) ?? null;
  } catch (error) {
    return null;
  }
});
</script>

<style lang="scss" scoped>
.tooltip-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  white-space: pre-line;

  padding: 0.25em 0.5em;
  border-radius: 0.25em;

  width: 100%;
  background-color: #1f1f1f;
  box-shadow: 0 0 5px 2px #aaa;
}

img {
  height: 1em;
}
</style>
