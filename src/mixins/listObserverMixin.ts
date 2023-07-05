import { defineComponent } from 'vue';

export default defineComponent({
  data: () => ({
    observer: null as IntersectionObserver | null,
    observerTarget: null as Element | null,
  }),

  methods: {
    mountObserver(actionFunction: () => void, target: Element) {
      this.observer = new IntersectionObserver((entries) => {
        console.log(entries);
        
        if (entries[0].intersectionRatio > 0.5) actionFunction();
      }, { threshold: 0.2 });

      this.observer.observe(target);
    },

    unmountObserver() {
      if (!this.observerTarget) return;

      this.observer?.unobserve(this.observerTarget);
    },
  },
});
