<template>
  <div class="options">
    <div class="options-actions">
      <button
        class="action-btn"
        :class="{'open': filterCardOpen}"
        @click="() => toggleCardsState('filter')"
      >
        <img :src="require('@/assets/icon-filter2.svg')" alt="icon-filter" />
        <p>FILTRY</p>
      </button>

      <button
        class="action-btn"
        :class="{'open': legendCardOpen}"
        @click="() => toggleCardsState('legend')"
      >
        <img :src="require('@/assets/icon-legend.svg')" alt="icon legend" />
        <p>LEGENDA</p>
      </button>
    </div>

    <div class="options-content">
      <transition name="card-anim"></transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({})
export default class Options extends Vue {
  filterCardOpen: boolean = false;
  legendCardOpen: boolean = false;

  toggleCardsState(name: string): void {
    if (name == "filter") {
      this.legendCardOpen = false;
      this.filterCardOpen = !this.filterCardOpen;
    }

    if (name == "legend") {
      this.filterCardOpen = false;
      this.legendCardOpen = !this.legendCardOpen;
    }
  }

  toggleCardState(): void {
    this.filterCardOpen = !this.filterCardOpen;
  }

  toggleLegendCardState(): void {
    this.legendCardOpen = !this.legendCardOpen;
  }
}
</script>


<style lang="scss" scoped>
@import "../../styles/variables.scss";
@import "../../styles/responsive.scss";

.options {
  display: flex;
  z-index: 5;
}

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
  display: flex;
  align-items: center;

  background: #333;
  border: none;

  color: #e0e0e0;
  font-size: 0.75em;

  padding: 0.3em;

  outline: none;
  cursor: pointer;

  transition: all 0.3s;

  img {
    width: 1.3em;
    margin-right: 0.2em;
  }

  p {
    max-width: 0;
    font-size: 1em;
    overflow: hidden;

    transition: max-width 0.35s ease-in-out;
  }

  &:hover > p,
  &.open > p {
    max-width: 500px;
    color: $accentCol;
  }

  &:hover {
    background: rgba(#e0e0e0, 0.4);
  }
}

@include smallScreen {
  .options {
    display: flex;
    justify-content: center;
  }

  .action-btn {
    font-size: 0.8rem;
  }
}
</style>