<template>
  <button class="btn--action" :class="option.section" :data-selected="option.value" @click="handleChange">
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
    handleChange() {
      this.option.value = !this.option.value;

      this.filterStore.changeFilterValue({
        name: this.option.name,
        value: !this.option.value,
      });
    },
  },
});
</script>

<style lang="scss" scoped>
$accessCol: #e03b07;
$controlCol: #0085ff;
$signalCol: #bf7c00;
$statusCol: #349b32;
$saveCol: #28a826;
$routesCol: #9049c0;

button {
  width: 100%;
  padding: 0.4em;
  border-radius: 0.4em;

  &:focus-visible {
    outline: 1px solid white;
  }

  &[data-selected='true'] {
    &.access {
      background-color: $accessCol;
      box-shadow: 0 0 6px 1px $accessCol;
    }

    &.control {
      background-color: $controlCol;
      box-shadow: 0 0 6px 1px $controlCol;
    }

    &.signals {
      background-color: $signalCol;
      box-shadow: 0 0 6px 1px $signalCol;
    }

    &.routes {
      background-color: $routesCol;
      box-shadow: 0 0 6px 1px $routesCol;
    }

    &.status {
      background-color: $statusCol;
      box-shadow: 0 0 6px 1px $statusCol;
    }

    &.save {
      background-color: $saveCol;
      box-shadow: 0 0 6px 1px $saveCol;
    }

    &.troll {
      background-color: firebrick;
      box-shadow: 0 0 6px 1px firebrick;
    }

    &.mode {
      background-color: lightgreen;
      color: black;

      font-weight: 500;
    }
  }
}
</style>
