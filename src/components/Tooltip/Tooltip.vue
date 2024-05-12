<template>
  <div class="tooltip" v-show="tooltipStore.type" ref="preview">
    <component v-if="tooltipStore.type" :is="tooltipStore.type" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useTooltipStore } from '../../store/tooltipStore';
import DonatorTooltip from './DonatorTooltip.vue';
import VehiclePreviewTooltip from './VehiclePreviewTooltip.vue';
import BaseTooltip from './BaseTooltip.vue';
import SpawnsTooltip from './SpawnsTooltip.vue';
import UsersTooltip from './UsersTooltip.vue';

export default defineComponent({
  components: { DonatorTooltip, VehiclePreviewTooltip, BaseTooltip, SpawnsTooltip, UsersTooltip },

  data() {
    return {
      tooltipStore: useTooltipStore()
    };
  },

  watch: {
    'tooltipStore.mousePos': {
      deep: true,
      // [x, y]
      handler(val: [number, number]) {
        this.$nextTick(() => {
          const previewEl = this.$refs['preview'] as HTMLElement;
          const clientWidth = document.body.clientWidth;
          const boxWidth = previewEl.getBoundingClientRect().width;

          let translateX = '0',
            translateY = '30px';

          if (clientWidth < 500) {
            previewEl.style.left = '50%';
            translateX = '-50%';
          } else if (val[0] <= boxWidth / 2) {
            previewEl.style.left = '0';
            translateX = '0px';
          } else if (val[0] >= clientWidth - boxWidth / 2) {
            previewEl.style.left = '100%';
            translateX = '-100%';
          } else {
            previewEl.style.left = `${val[0]}px`;
            translateX = '-50%';
          }

          previewEl.style.top = `${val[1]}px`;

          const isOutside =
            val[1] + previewEl.getBoundingClientRect().height + 30 >=
            window.innerHeight + window.scrollY;

          if (isOutside) translateY = 'calc(-100% - 30px)';
          previewEl.style.transform = `translate(${translateX}, ${translateY})`;
        });
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.tooltip {
  position: absolute;
  z-index: 250;
  max-width: 400px;
  text-align: center;
}
</style>
