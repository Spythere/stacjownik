<template>
  <div class="app-bar">
    <div class="bar-content flex flex-spaced">
      <div class="bar-left">
        <Options />
      </div>

      <div class="bar-center"></div>

      <div class="bar-right">
        <span class="counter dispatchers">
          <img src="@/assets/icon-dispatcher.svg" alt="icon dispatcher" />
          {{stationCount}}
        </span>

        <span class="counter trains">
          {{trainCount}}
          <img src="@/assets/icon-train.svg" alt="icon train" />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import Options from "@/components/ui/Options.vue";

@Component({
  components: { Options }
})
export default class AppBar extends Vue {
  @Prop(Number) trainCount;
  @Prop(Number) stationCount;
}
</script>

<style lang="scss">
.app-bar {
  display: flex;
  justify-content: space-between;

  position: sticky;
  top: 0;
  font-size: 0.3em;
  background: #222;
}

.bar {
  &-left {
    display: flex;

    & > .legend {
      display: flex;
      align-items: center;

      img {
        width: 1.6em;
      }
    }
  }

  &-right {
    font-size: 1.35em;
    display: flex;
  }
}
</style>