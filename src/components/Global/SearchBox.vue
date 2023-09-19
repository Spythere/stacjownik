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
      :src="getIcon('exit')"
      alt="exit-icon"
      @click="clearValue"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import imageMixin from "../../mixins/imageMixin";

export default defineComponent({
  mixins: [imageMixin],

  emits: ["update:searchedValue", "clearValue"],
  props: {
    searchedValue: {
      type: String,
      required: true,
    },
    updateOnInput: {
      type: Boolean,
      default: true,
    },
    titleToTranslate: {
      type: String,
      required: true,
    },
    clearValue: {
      type: Function,
    },
  },

  setup(props, { emit }) {
    const compSearchedValue = ref(props.searchedValue);

    if (props.updateOnInput) {
      watch(
        () => compSearchedValue.value,
        (value) => {
          emit("update:searchedValue", value);
        }
      );
    }

    const clearValue = () => {
      compSearchedValue.value = "";
      emit("clearValue");
    };

    const updateValue = (e: any) => {
      if (!props.updateOnInput && e.keyCode == 13)
        emit("update:searchedValue", compSearchedValue.value);
    };

    return {
      compSearchedValue,
      updateValue,
      clearValue,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";

.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 220px;

    margin: 0.5em 0 0.5em 0.5em;

    @include smallScreen() {
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