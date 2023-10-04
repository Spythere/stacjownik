import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return {
      preventKeyDown: false
    };
  },

  activated() {
    window.addEventListener('keydown', this.handleKeyDown);
  },

  deactivated() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },

  methods: {
    onKeyDownFunction() {},

    handleKeyDown(e: KeyboardEvent) {
      if (!e.key) return;
      if (e.key.toLowerCase() == 'f' && !this.preventKeyDown && !e.ctrlKey && !e.altKey)
        this.onKeyDownFunction();
    }
  }
});
