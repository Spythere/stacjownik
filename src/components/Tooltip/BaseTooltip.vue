<template>
  <div class="tooltip-content">
    <span>{{ tooltipStore.content }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useTooltipStore } from '../../store/tooltipStore';

export default defineComponent({
  data() {
    return {
      tooltipStore: useTooltipStore()
    };
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
