import { defineComponent } from 'vue';
import { useMainStore } from '../store/mainStore';
import { PopUpType, popupKeys } from '../store/typings';

const isPopUp = (v: any): v is PopUpType => popupKeys.includes(v);

export default defineComponent({
  data() {
    return {
      store: useMainStore()
    };
  },

  methods: {
    showPopUp(e: MouseEvent, componentKey: string, value?: string) {
      if (!isPopUp(componentKey)) return;

      this.store.popUpData['key'] = componentKey;
      this.store.popUpData['content'] = value ?? '';
    },

    hidePopUp() {
      this.store.popUpData['key'] = null;
      this.store.popUpData['content'] = '';
    }
  }
});
