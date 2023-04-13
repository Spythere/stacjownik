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
    background-color: forestgreen;
    font-weight: bold;
  }
}
</style>

