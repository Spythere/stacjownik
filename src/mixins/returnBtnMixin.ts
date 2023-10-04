import { defineComponent } from 'vue';
import imageMixin from './imageMixin';

export default defineComponent({
  mixins: [imageMixin],

  data() {
    return {
      icons: {
        arrow: this.getIcon('arrow-asc')
      },

      showReturnButton: false
    };
  },

  methods: {
    scrollToTop() {
      window.scrollTo({ top: 0 });
    },

    handleScroll() {
      this.showReturnButton = window.scrollY > window.innerHeight * 0.35;
    }
  },

  activated() {
    window.addEventListener('wheel', this.handleScroll);
  },

  deactivated() {
    window.removeEventListener('wheel', this.handleScroll);
  }
});
