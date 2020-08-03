<template>
  <div class="app-bar">
    <Options />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import Options from "@/components/ui/Options.vue";

@Component({
  components: { Options },
})
export default class AppBar extends Vue {}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";

.app-bar {
  display: flex;
  justify-content: space-between;

  position: sticky;
  top: 0;
  font-size: 0.35em;
  background: #222;
}

.counter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  span {
    margin: 0 0.3em;
  }
}

@include smallScreen {
  .app-bar {
    font-size: 0.8rem;
  }
}
</style>