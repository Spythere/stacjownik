<template>
  <button
    class="btn--action"
    :class="option.section"
    :data-selected="option.value"
    @click="handleLeftClick"
    @dblclick="handleDbClick"
  >
    {{ $t(`filters.${option.id}`) }}
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStationFiltersStore } from '../../store/stationFiltersStore';

interface FilterOption {
  id: string;
  name: string;
  section: string;
  value: boolean;
  defaultValue: boolean;
}

export default defineComponent({
  props: {
    option: {
      type: Object as () => FilterOption,
      required: true,
    },
  },

  setup() {
    return {
      filterStore: useStationFiltersStore(),
    };
  },

  methods: {
    handleLeftClick() {
      this.option.value = !this.option.value;
      this.filterStore.lastClickedFilterId = '';

      this.filterStore.changeFilterValue({
        name: this.option.name,
        value: !this.option.value,
      });
    },

    handleDbClick(e: Event) {
      e.preventDefault();

      
      const lastClicked = this.filterStore.lastClickedFilterId == this.option.id;
      console.log(this.filterStore.lastClickedFilterId);
      this.filterStore.lastClickedFilterId = this.option.id;
      this.option.value = true;

      this.filterStore.changeFilterValue({
        name: this.option.name,
        value: !this.option.value,
      });

      this.filterStore.inputs.options
        .filter((option) => {
          return option.section == this.option.section && option.id != this.option.id;
        })
        .forEach((option) => {
          this.filterStore.changeFilterValue({
            name: option.name,
            value: this.option.value,
          });

          option.value = !this.option.value;
        });
    },
  },
});
</script>

<style lang="scss" scoped>
$realityCol: #e03b07;
$accessCol: #e03b07;
$controlCol: #0085ff;
$signalCol: #bf7c00;
$statusCol: #349b32;
$saveCol: #28a826;
$routesCol: #9049c0;

button {
  padding: 0.25em;
  border-radius: 0;

  &:focus-visible {
    outline: 1px solid white;
  }

  &[data-selected='true'] {
    //  &.reality {
    //   background-color: $realityCol;
    //   box-shadow: 0 0 6px 1px $realityCol;
    // }

    // &.access {
    //   background-color: $accessCol;
    //   box-shadow: 0 0 6px 1px $accessCol;
    // }

    // &.control {
    //   background-color: $controlCol;
    //   box-shadow: 0 0 6px 1px $controlCol;
    // }

    // &.signals {
    //   background-color: $signalCol;
    //   box-shadow: 0 0 6px 1px $signalCol;
    // }

    // &.routes {
    //   background-color: $routesCol;
    //   box-shadow: 0 0 6px 1px $routesCol;
    // }

    // &.status {
    //   background-color: $statusCol;
    //   box-shadow: 0 0 6px 1px $statusCol;
    // }

    // &.save {
    //   background-color: $saveCol;
    //   box-shadow: 0 0 6px 1px $saveCol;
    // }

    // &.troll {
    //   background-color: firebrick;
    //   box-shadow: 0 0 6px 1px firebrick;
    // }

    // & {
    background-color: forestgreen;

    font-weight: bold;
    // }
  }
}
</style>

