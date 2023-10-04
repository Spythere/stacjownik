<template>
  <div class="progress-bar">
    <span class="bar-bg"></span>
    <span
      class="bar-fg"
      :style="{ width: `${~~progressPercent}%`, backgroundColor: bgColor }"
    ></span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    progressPercent: {
      type: Number,
      required: true
    },
    progressType: {
      type: String,
      required: false
    }
  },

  computed: {
    bgColor() {
      switch (this.progressType) {
        case 'abandoned':
          return 'salmon';

        default:
          return 'springgreen';
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.progress-bar {
  position: relative;

  width: 6em;
  height: 1em;
  margin: 0.5em 0;

  .bar-fg,
  .bar-bg {
    position: absolute;
    height: 1em;
    width: 100%;

    left: 0;
  }

  .bar-fg {
    background-color: springgreen;
  }

  .bar-bg {
    background-color: #5b5b5b;
  }
}
</style>
