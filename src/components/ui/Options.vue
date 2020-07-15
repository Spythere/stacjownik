<template>
  <div class="options">
    <div class="options-actions">
      <button class="action-btn button" :class="{'open': filterCardOpen}" @click="toggleCardState">
        <img :src="require('@/assets/icon-filter2.svg')" alt="icon-filter" />
      </button>
    </div>

    <keep-alive>
      <transition name="card-anim">
        <OptionCard v-if="filterCardOpen" :exit="toggleCardState" />
      </transition>
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

.card-anim {
  &-enter-active,
  &-leave-active {
    transition: all 0.25s ease-in-out;
  }

  &-enter,
  &-leave-to {
    transform: translate(-45%, -50%);
    opacity: 0;
  }
}

.options {
  font-size: calc(0.6rem + 0.9vw);

  &-actions {
    display: flex;
  }
}

.action-btn {
  img {
    width: 1.3em;
  }
}
</style>