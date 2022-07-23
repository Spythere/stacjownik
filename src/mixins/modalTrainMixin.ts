import { defineComponent } from 'vue';
import { useStore } from '../store/store';

export default defineComponent({
  setup() {
    return {
      store: useStore(),
    };
  },

  mounted() {
    console.log('Mixin mounted');
  },

  computed: {
    chosenTrain() {
      return this.store.trainList.find((train) => train.trainId == this.store.chosenModalTrainId);
    },
  },

  methods: {
    selectModalTrain(trainId: string) {
      this.store.chosenModalTrainId = trainId;
    },

    closeModal() {
      this.store.chosenModalTrainId = undefined;
    },
  },
});
