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

        previewEl.style.top = `${val.y}px`;
        previewEl.style.left = `${val.x}px`;
        previewEl.style.transform = 'translateY(1.5rem)';

        this.$nextTick(() => {
          const isOutside =
            val.y + previewEl.getBoundingClientRect().height > window.innerHeight + window.scrollY;

          previewEl.style.transform = `translate(-50%, calc(${
            isOutside ? '-100% - 1.5rem' : '1.5rem'
          }))`;
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
