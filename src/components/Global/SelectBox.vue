<template>
  <div class="select-box" v-click-outside="clickedOutside">
    <div class="select-box_content">
      <button class="selected" @click="toggleBox">
        {{ computedSelectedItem.value }}
      </button>

      <transition
        name="expand"
        @enter="expandEnter"
        @after-enter="expandAfterEnter"
        @leave="expandLeave"
      >
        <ul class="options" v-show="listOpen" :ref="(el) => (listRef = el)">
          <li class="option" v-for="item in itemList" :key="item.id">
            <label :for="item.id">
              <input
                type="button"
                :id="item.id"
                name="select-box"
                @click="selectOption(item)"
              />
              <span
                :style="
                  computedSelectedItem.id == item.id ? 'color: gold;' : ''
                "
              >
                {{ item.value }}
              </span>
            </label>
          </li>
        </ul>
      </transition>
    </div>

    <div class="arrow">
      <img :src="listOpen ? ascIcon : descIcon" alt="arrow-icon" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from "@vue/runtime-core";

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
    let listRef: Ref<Element | null> = ref(null);
    let buttonRef: Ref<HTMLButtonElement | null> = ref(null);

    let activeEl: Ref<Element | null> = ref(document.activeElement);

    let listOpen = ref(false);
    let selectedItem: Ref<Item> = ref(props.itemList[props.defaultItemIndex]);

    const computedSelectedItem = computed(() => {
      return (
        props.itemList.find((item) => item.id === selectedItem.value.id) ||
        props.itemList[props.defaultItemIndex]
      );
    });

    const computedHeight = computed(() =>
      listRef.value ? getComputedStyle(listRef.value).height : 0
    );

    const buttonFocused = computed(() => document.activeElement);

    return {
      computedSelectedItem,
      listOpen,
      selectedItem,
      listRef,
      buttonRef,
      computedHeight,
      buttonFocused,
      activeEl,
    };
  },

  methods: {
    selectOption(item: Item) {
      this.selectedItem = item;
      this.listOpen = false;

      this.$emit("selected", item);
    },

    toggleBox() {
      this.listOpen = !this.listOpen;
    },

    clickedOutside() {
      this.listOpen = false;
      this.buttonRef?.blur();
    },

    expandEnter(el: HTMLElement) {
      el.style.height = "auto";

      const currentHeight = getComputedStyle(el).height;

      el.style.height = "0";

      setTimeout(() => {
        el.style.height = currentHeight;
      }, 50);
    },

    expandAfterEnter(el: HTMLElement) {
      el.style.height = "auto";
    },

    expandLeave(el: HTMLElement) {
      el.style.height = getComputedStyle(el).height;

      getComputedStyle(el);

      setTimeout(() => {
        el.style.height = "0";
      }, 50);
    },
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/variables.scss";

.expand {
  &-enter-active,
  &-leave-active {
    transition: height 150ms ease-out;
    overflow: hidden;
  }
}

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
  background-color: hsla(0, 0%, 0%, 0.85);

  &:hover,
  &:focus {
    background-color: hsla(0, 0%, 20%, 0.85);
  }

  padding: 0.75em 0;

  width: 100%;

  cursor: pointer;
}
</style>