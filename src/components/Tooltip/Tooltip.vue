<template>
  <div class="tooltip" ref="preview">
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

const BOX_PADDING_PX = 20;

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
            translateY = `calc(-100% - ${BOX_PADDING_PX}px)`;

          if (val[0] <= boxWidth / 2 + BOX_PADDING_PX) {
            previewEl.style.left = '0';
            translateX = BOX_PADDING_PX + 'px';
          } else if (val[0] >= clientWidth - boxWidth / 2 - BOX_PADDING_PX) {
            previewEl.style.left = '100%';
            translateX = `calc(-100% - ${BOX_PADDING_PX}px)`;
          } else {
            previewEl.style.left = `${val[0]}px`;
            translateX = '-50%';
          }

          previewEl.style.top = `${val[1]}px`;

          const isOutside =
            val[1] - previewEl.getBoundingClientRect().height <=
            window.scrollY + BOX_PADDING_PX * 2;

          if (isOutside) translateY = BOX_PADDING_PX + 'px';
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
