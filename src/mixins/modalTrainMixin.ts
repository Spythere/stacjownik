import { defineComponent } from 'vue';
import { useStore } from '../store/store';

export default defineComponent({
  data() {
    return {
      store: useStore()
    };
  },

  computed: {
    chosenTrain() {
      return this.store.trainList.find((train) => train.trainId == this.store.chosenModalTrainId);
    }
  },

  methods: {
    selectModalTrain(trainId: string, target?: EventTarget | null) {
      this.store.chosenModalTrainId = trainId;
      document.body.classList.add('no-scroll');
      if (target) this.store.modalLastClickedTarget = target;
    },

    closeModal() {
      this.store.chosenModalTrainId = undefined;

      setTimeout(() => {
        (this.store.modalLastClickedTarget as any)?.focus();
        document.body.classList.remove('no-scroll');
      }, 150);
    }
  }
});
