<template>
  <div class="select-box">
    <div class="select-box_content">
      <button class="selected" @click="toggleBox">
        <span>{{ computedSelectedItem.selectedValue || computedSelectedItem.value }}</span>

        <div class="arrow">
          <img :src="`/images/icon-arrow-${listOpen ? 'asc' : 'desc'}.svg`" alt="Arrow icon" />
        </div>
      </button>

      <ul class="options" :ref="(el) => (listRef = el as Element)">
        <li class="option" v-for="(item, i) in itemList" :key="item.id">
          <transition
            name="unfold"
            :style="`
            --delay-in: ${i * 55}ms; 
            --delay-out: ${(itemList.length - 1 - i) * 55}ms`"
          >
            <label :for="item.id" v-if="listOpen">
              <input type="button" :id="item.id" name="select-box" @click="selectOption(item)" />
              <span
                :style="computedSelectedItem.id == item.id ? 'color: gold;' : ''"
                v-html="item.value"
              >
              </span>
            </label>
          </transition>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, computed } from 'vue';

interface Item {
  id: string;
  value: string;
  selectedValue?: string;
}

export default defineComponent({
  emits: ['selected'],

  props: {
    itemList: {
      type: Array as () => Item[],
      required: true
    },

    defaultItemIndex: {
      type: Number,
      default: 0
    },

    prefix: {
      type: String,
      default: ''
    }
  },

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

    return {
      computedSelectedItem,
      listOpen,
      selectedItem,
      listRef,
      buttonRef,
      activeEl
    };
  },

  watch: {
    '$route.query': {
      immediate: true,
      handler(newVal) {
        if (newVal.region) {
          const item = this.itemList.find((it) => it.id == newVal.region);

          if (item) this.selectedItem = item;
        }
      }
    }
  },

  methods: {
    selectOption(item: Item) {
      this.selectedItem = item;
      this.listOpen = false;

      this.$emit('selected', item);
    },

    toggleBox(e: Event) {
      this.listOpen = !this.listOpen;

      if (!this.listOpen) (e.target as HTMLButtonElement).blur();
    },

    clickedOutside() {
      this.listOpen = false;
      this.buttonRef?.blur();
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.unfold {
  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.85);
  }

  &-enter-active,
  &-leave-active {
    transition: all 110ms ease-out;
  }

  &-enter-active {
    transition-delay: var(--delay-in);
  }

  &-leave-active {
    transition-delay: var(--delay-out);
  }
}

.select-box {
  display: flex;
  align-items: center;
}

.arrow {
  img {
    vertical-align: middle;
    width: 1.35em;
  }
}

button.selected {
  color: paleturquoise;

  font-weight: bold;
  padding: 0.1em 0.5em;

  &:focus {
    background-color: #262626;
  }
}

.select-box_content {
  position: relative;
  margin: 0 auto;

  height: 100%;

  text-align: center;
}

ul.options {
  position: absolute;
  top: 100%;
  left: 0;

  height: auto;

  z-index: 100;
  width: 100%;

  font-size: 0.9em;
}

li.option {
  input {
    position: absolute;
    top: 0;
    left: 0;

    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: none;
    outline: none;
    background: none;

    &:focus + span {
      color: $accentCol;
      font-weight: 800;
    }
  }

  &:last-child label {
    border-radius: 0 0 1em 1em;
  }

  label {
    position: relative;

    display: inline-block;
    background-color: #262626f2;

    &:hover,
    &:focus {
      background-color: #333333f2;
    }

    padding: 0.5em 0;

    width: 100%;

    cursor: pointer;
  }
}
</style>
