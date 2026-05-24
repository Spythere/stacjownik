<template>
  <div class="tooltip-content">
    <img src="/images/icon-creator.png" alt="creator icon" />
    <b class="text--creator">&nbsp;{{ tooltipStore.content }}</b>
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
  padding: 0.5em;
  border-radius: 0.25em;

  width: 100%;

  background-color: #333;
  box-shadow: 0 0 10px 2px #aaa;
}

img {
  vertical-align: text-bottom;
  height: 1.25em;
}
</style>
