<template>
  <section class="clock">{{ formattedDate }}</section>
</template>


<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "clock",
  data: () => ({
    timestamp: Date.now(),
  }),
  computed: {
    formattedDate() {
      return new Date(this.timestamp).toLocaleString("pl-PL");
    },
  },
  mounted() {
    setInterval(() => (this.timestamp = Date.now()), 1000);
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";

.clock {
  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 0.35em;

  @include smallScreen() {
    font-size: 0.65rem;
  }
}
</style>