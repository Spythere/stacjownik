import { defineComponent } from 'vue';
import { useStore } from '../store/store';

export default defineComponent({
  setup() {
    return {
      store: useStore(),
    };
  },

  computed: {
    chosenTrain() {
      return this.store.trainList.find((train) => train.trainId == this.store.chosenModalTrainId);
    },
  },

  methods: {
    selectModalTrain(trainId: string) {
      this.store.chosenModalTrainId = trainId;
      document.body.classList.add('no-scroll');
    },

    closeModal() {
      this.store.chosenModalTrainId = undefined;

      setTimeout(() => {
        document.body.classList.remove('no-scroll');
      }, 150);
    },
  },
});
