<template>
  <div class="search-box">
    <input
      class="search-input"
      :placeholder="$t(titleToTranslate)"
      v-model="compSearchedValue"
      @keypress="updateValue"
    />

    <img
      class="search-exit"
      src="/images/icon-exit.svg"
      alt="exit-icon"
      @click="clearSearchValue"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  emits: ['update:searchedValue', 'clearValue'],
  props: {
    searchedValue: { type: String, required: true },
    updateOnInput: { type: Boolean, default: true },
    titleToTranslate: { type: String, required: true },
    clearValue: { type: Function }
  },

  setup(props, { emit }) {
    const compSearchedValue = ref(props.searchedValue);

    if (props.updateOnInput) {
      watch(
        () => compSearchedValue.value,
        (value) => {
          emit('update:searchedValue', value);
        }
      );
    }

    const clearSearchValue = () => {
      compSearchedValue.value = '';
      emit('clearValue');
    };

    const updateValue = (e: any) => {
      if (!props.updateOnInput && e.keyCode == 13)
        emit('update:searchedValue', compSearchedValue.value);
    };

    return { compSearchedValue, updateValue, clearSearchValue };
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 220px;

    margin: 0.5em 0 0.5em 0.5em;

    @include responsive.smallScreen{
      width: 85%;
    }
  }

  &-input {
    border: none;

    min-width: 85%;
    padding: 0.35em 0.5em;
  }

  &-exit {
    position: absolute;
    cursor: pointer;

    top: 50%;
    right: 10px;
    transform: translateY(-50%);

    width: 1em;
  }
}
</style>
