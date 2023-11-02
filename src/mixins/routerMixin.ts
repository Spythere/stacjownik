import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    navigateTo(path: string, query?: {}) {
      this.$router.push({
        path,
        query
      });
    }
  }
});
