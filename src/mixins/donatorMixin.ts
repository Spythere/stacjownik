import { defineComponent } from 'vue';
import { useApiStore } from '../store/apiStore';

export default defineComponent({
  data() {
    return {
      apiStore: useApiStore()
    };
  },

  methods: {
    isDonator(name: string) {
      return this.apiStore.donatorsData.includes(name);
    }
  }
});
