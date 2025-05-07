<template>
  <div class="tooltip-content">
    <img src="/images/icon-diamond.svg" alt="donator diamond icon" />
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
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;

  padding: 0.5em;
  border-radius: 0.25em;

  width: 100%;

  background-color: #333;
  box-shadow: 0 0 10px 2px #aaa;
}

img {
  vertical-align: middle;
  height: 1em;
}
</style>
