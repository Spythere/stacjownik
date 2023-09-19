import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    getIcon(name: string, ext = 'svg') {
      return new URL(`../assets/icon-${name}.${ext}`, import.meta.url).href;
    },

    getImage(name: string) {
        return new URL(`../assets/${name}`, import.meta.url).href;
    }
  },
});
