<template>
  <div class="select-box">
    <div class="select-box_content">
      <button class="selected" @click="toggleBox">
        <span class="text--primary">{{ prefix }}</span>
        <span>{{ computedSelectedItem.selectedValue || computedSelectedItem.value }}</span>
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
              <span :style="computedSelectedItem.id == item.id ? 'color: gold;' : ''" v-html="item.value"> </span>
            </label>
          </transition>
        </li>
      </ul>
    </div>

    <div class="arrow">
      <img :src="listOpen ? getIcon('arrow-asc') : getIcon('arrow-desc')" alt="arrow-icon" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, computed } from 'vue';
import imageMixin from '../../mixins/imageMixin';

interface Item {
  id: string;
  value: string;
  selectedValue?: string;
}

export default defineComponent({
  emits: ['selected'],
  mixins: [imageMixin],

  props: {
    itemList: {
      type: Array as () => Item[],
      required: true,
    },

    defaultItemIndex: {
      type: Number,
      default: 0,
    },

    prefix: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    let listRef: Ref<Element | null> = ref(null);
    let buttonRef: Ref<HTMLButtonElement | null> = ref(null);

    let activeEl: Ref<Element | null> = ref(document.activeElement);

    let listOpen = ref(false);
    let selectedItem: Ref<Item> = ref(props.itemList[props.defaultItemIndex]);

    const computedSelectedItem = computed(() => {
      return props.itemList.find((item) => item.id === selectedItem.value.id) || props.itemList[props.defaultItemIndex];
    });

    return {
      computedSelectedItem,
      listOpen,
      selectedItem,
      listRef,
      buttonRef,
      activeEl,
    };
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
    },
  },
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
  position: relative;
  width: auto;
}

.arrow {
  position: absolute;
  top: 50%;
  right: 0;
  padding: 0;

  img {
    vertical-align: middle;
    width: 1.35em;
  }

  transform: translateY(-50%);

  pointer-events: none;
}

button.selected {
  background-color: transparent;
  color: paleturquoise;

  font-size: 1em;
  font-weight: bold;

  padding: 0.1em 0.5em;
  margin-right: 1.4em;

  width: 100%;
  cursor: pointer;

  border: none;
  outline: none;

  text-align: left;

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
