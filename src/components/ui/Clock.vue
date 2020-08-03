<template>
  <div class="clock">{{ formattedDate }}</div>
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
      return new Date(this.timestamp).toLocaleString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
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

  @include smallScreen() {
    font-size: 0.65rem;
  }
}
</style>