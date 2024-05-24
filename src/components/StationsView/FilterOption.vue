<template>
  <label @dblclick="handleDbClick">
    <input
      :checked="optionValue"
      @input="$emit('update:optionValue', ($event.target as HTMLInputElement).checked)"
      type="checkbox"
      :class="option.section"
      :name="option.id"
    />
    <span>
      {{ $t(`filters.${option.id}`) }}
    </span>
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

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
      required: true
    },

    optionValue: {
      type: Boolean,
      required: true
    }
  },

  emits: ['update:optionValue'],

  watch: {
    'option.value'() {
      // this.filterStore.changeFilterValue(this.option.name, !this.option.value);
    }
  },

  methods: {
    handleDbClick(e: Event) {
      e.preventDefault();

      // this.filterStore.lastClickedFilterId = this.option.id;
      // this.option.value = true;
      this.$emit('update:optionValue', true);

      // this.filterStore.inputs.options
      //   .filter((option) => {
      //     return option.section == this.option.section && option.id != this.option.id;
      //   })
      //   .forEach((option) => {
      //     option.value = !this.option.value;
      //   });
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

label {
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;

  span {
    cursor: pointer;
    display: inline-block;
    width: 100%;
    text-align: center;
    padding: 0.25em;
    background-color: #444;
  }

  span:hover {
    background-color: #555;
  }

  input[type='checkbox'] {
    cursor: pointer;
    position: absolute;
    opacity: 0;

    &:checked + span {
      background-color: forestgreen;
      font-weight: bold;
    }

    &:focus-visible + span {
      outline: 1px solid $accentCol;
    }
  }
}
</style>
