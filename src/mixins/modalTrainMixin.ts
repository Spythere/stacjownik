import { defineComponent } from 'vue';
import { useMainStore } from '../store/mainStore';
import { useTooltipStore } from '../store/tooltipStore';

export default defineComponent({
  data() {
    return {
      store: useMainStore(),
      tooltipStore: useTooltipStore()
    };
  },

  methods: {
    selectModalTrain(trainId: string, target?: EventTarget | null) {
      this.store.chosenModalTrainId = trainId;
      document.body.classList.add('no-scroll');
      if (target) this.store.modalLastClickedTarget = target;
    },

    closeModal() {
      this.store.chosenModalTrainId = undefined;
      this.tooltipStore.hide();

      setTimeout(() => {
        (this.store.modalLastClickedTarget as any)?.focus();
        document.body.classList.remove('no-scroll');
      }, 150);
    }
  }
});
