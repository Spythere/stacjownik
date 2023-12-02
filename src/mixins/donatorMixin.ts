import { defineComponent } from 'vue';
import { useStore } from '../store/mainStore';

export default defineComponent({
  data() {
    return {
      store: useStore()
    };
  },

  methods: {
    isDonator(name: string) {
      return this.store.donatorsData.includes(name);
    }
  }
});
