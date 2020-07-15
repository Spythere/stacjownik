<template>
  <div class="options">
    <div class="options-actions">
      <button class="action-btn button" :class="{'open': filterCardOpen}" @click="toggleCardState">
        <img :src="require('@/assets/icon-filter2.svg')" alt="icon-filter" /> OPCJE
      </button>
    </div>

    <keep-alive>
      <OptionCard v-if="filterCardOpen" :exit="toggleCardState" />
    </keep-alive>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import OptionCard from "@/components/ui/OptionCard.vue";

@Component({
  components: { OptionCard }
})
export default class Options extends Vue {
  filterCardOpen: boolean = false;

  toggleCardState(): void {
    this.filterCardOpen = !this.filterCardOpen;
  }
}
</script>


<style lang="scss" scoped>
@import "../../styles/variables.scss";
@import "../../styles/responsive.scss";

.options {
  font-size: calc(0.6rem + 0.9vw);

  &-actions {
    display: flex;
  }
}

.action-btn {
  font-size: 0.75em;
  margin: 0 0.2em;

  img {
    width: 1.3em;
  }
}
</style>