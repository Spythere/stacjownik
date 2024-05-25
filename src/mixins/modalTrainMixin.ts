import { defineComponent } from 'vue';
import { useMainStore } from '../store/mainStore';
import { useTooltipStore } from '../store/tooltipStore';
import { Train } from '../typings/common';

export default defineComponent({
  data() {
    return {
      store: useMainStore(),
      tooltipStore: useTooltipStore()
    };
  },

  methods: {
    selectModalTrain(train: Train, target?: EventTarget | null) {
      this.store.chosenModalTrainId = train.modalId;
      if (target) this.store.modalLastClickedTarget = target;
    },

    selectModalTrainById(modalId: string, target?: EventTarget | null) {
      this.store.chosenModalTrainId = modalId;
      if (target) this.store.modalLastClickedTarget = target;
    },

    closeModal() {
      this.store.chosenModalTrainId = undefined;
      this.tooltipStore.hide();
    }
  }
});
