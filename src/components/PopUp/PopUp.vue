<template>
  <div class="popup" v-show="popupStore.currentPopupComponent" ref="preview">
    <component v-if="popupStore.currentPopupComponent" :is="popupStore.currentPopupComponent" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DonatorPopUp from './DonatorPopUp.vue';
import TrainCommentsPopUp from './TrainCommentsPopUp.vue';
import VehiclePreviewPopUp from './VehiclePreviewPopUp.vue';
import { usePopupStore } from '../../store/popupStore';

export default defineComponent({
  components: { DonatorPopUp, TrainCommentsPopUp, VehiclePreviewPopUp },

  data() {
    return {
      popupStore: usePopupStore()
    };
  },

  watch: {
    'popupStore.popupPosition': {
      deep: true,
      handler(val: typeof this.popupStore.popupPosition) {
        const previewEl = this.$refs['preview'] as HTMLElement;
        const clientWidth = document.body.clientWidth;
        const boxWidth = previewEl.getBoundingClientRect().width;

        let translateX = '0px',
          translateY = '30px';

        if (clientWidth < 500) {
          previewEl.style.left = '50%';
          translateX = '-50%';
        } else if (val.x <= boxWidth / 2) {
          previewEl.style.left = '0';
          translateX = '0px';
        } else if (val.x >= clientWidth - boxWidth / 2) {
          previewEl.style.left = '100%';
          translateX = '-100%';
        } else {
          previewEl.style.left = `${val.x}px`;
          translateX = '-50%';
        }

        previewEl.style.top = `${val.y}px`;

        this.$nextTick(() => {
          const isOutside =
            val.y + previewEl.getBoundingClientRect().height >= window.innerHeight + window.scrollY;

          if (isOutside) translateY = 'calc(-100% - 30px)';
          previewEl.style.transform = `translate(${translateX}, ${translateY})`;
        });
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.popup {
  position: absolute;
  z-index: 250;
  max-width: 400px;
  text-align: center;
}
</style>
