import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    getCategoryExplanation(categoryCode: string) {
      const categoryKey = categoryCode.slice(0, 2);
      const vehicleTypeKey = categoryCode.slice(-1);

      return `${this.$t('categories.' + categoryKey)}\n(${this.$t('categories.' + vehicleTypeKey)})`;
    }
  }
});
