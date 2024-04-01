import { defineComponent } from 'vue';
import { useMainStore } from '../store/mainStore';

export default defineComponent({
  data() {
    return {
      store: useMainStore()
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
      this.store.popUpData.key = null;

      setTimeout(() => {
        (this.store.modalLastClickedTarget as any)?.focus();
        document.body.classList.remove('no-scroll');
      }, 150);
    }
  }
});
