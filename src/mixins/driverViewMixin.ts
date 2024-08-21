import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    driverMixin_showDriverView(id: string) {
      this.$router.push({
        name: 'DriverView',
        query: {
          trainId: id
        }
      });
    }
  }
});
