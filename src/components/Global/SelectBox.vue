<template>
  <div class="select-box">
    <div class="select-box_content">
      <button
        class="selected"
        @click="toggleBox"
      >
        {{ computedSelectedItem.value }}
      </button>

      <div
        class="options"
        v-if="boxVisible"
      >
        <div
          class="option"
          v-for="item in itemList"
          :key="item.id"
        >
          <label :for="item.id">
            <input
              type="button"
              :id="item.id"
              name="select-box"
              @click="selectOption(item)"
            />

            <span :style="computedSelectedItem.id == item.id ? 'color: gold;' : ''">
              {{ item.value }}
            </span>
          </label>
        </div>
      </div>
    </div>

    <div class="arrow">
      <img
        :src="boxVisible ? ascIcon : descIcon"
        alt="arrow-icon"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  defineEmit,
  Ref,
  ref,
} from "@vue/runtime-core";

interface Item {
  id: string | number;
  value: string;
}

export default defineComponent({
  emits: ["selected"],

  props: {
    itemList: {
      type: Array as () => Item[],
      required: true,
    },

    defaultItemIndex: {
      type: Number,
      default: 0,
    },
  },

  data: () => ({
    ascIcon: require("@/assets/icon-arrow-asc.svg"),
    descIcon: require("@/assets/icon-arrow-desc.svg"),
  }),

  setup(props) {
    let boxVisible = ref(false);
    let selectedItem: Ref<Item> = ref(props.itemList[props.defaultItemIndex]);

    const computedSelectedItem = computed(() => {
      return (
        props.itemList.find((item) => item.id === selectedItem.value.id) ||
        props.itemList[props.defaultItemIndex]
      );
    });

    return {
      computedSelectedItem,
      boxVisible,
      selectedItem,
    };
  },

  methods: {
    selectOption(item: Item) {
      this.selectedItem = item;
      this.boxVisible = false;

      this.$emit("selected", item);
    },

    toggleBox() {
      this.boxVisible = !this.boxVisible;
    },
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.select-box {
  position: relative;
}

.arrow {
  position: absolute;
  top: 50%;
  right: 0.5em;

  img {
    vertical-align: middle;
    width: 1.35em;
  }

  transform: translateY(-50%);

  pointer-events: none;
}

.select-box_content {
  position: relative;
  margin: 0 auto;

  height: 100%;

  min-width: 10em;

  background: #333;

  text-align: center;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;

  height: auto;

  z-index: 10;

  width: 100%;

  margin-top: 0.25em;
}

button.selected {
  background: #333;
  color: white;

  font-size: 1em;

  padding: 0.35em 0.5em;
  padding-right: 2em;

  width: 100%;
  cursor: pointer;

  border: none;
  outline: none;

  text-align: left;

  &:focus {
    background: #555;
  }
}

input {
  position: absolute;
  top: 0;
  left: 0;

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;

  &:focus + span {
    color: $accentCol;
    font-weight: bold;
  }
}

label {
  position: relative;

  display: inline-block;
  background: #333;

  &:hover,
  &:focus {
    background: #555;
  }

  padding: 0.75em 0;

  width: 100%;

  cursor: pointer;
}
</style>