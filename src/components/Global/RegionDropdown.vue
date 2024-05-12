<template>
  <div class="region-dropdown" v-click-outside="clickedOutside">
    <div class="content">
      <button class="selected-region" @click="toggleBox">
        <span>{{ selectedItem.name }}</span>

        <img :src="`/images/icon-arrow-${listOpen ? 'asc' : 'desc'}.svg`" alt="Arrow icon" />
      </button>

      <ul class="options">
        <li class="option" v-for="(item, i) in regionList" :key="item.id">
          <transition
            name="unfold"
            :style="`
            --delay-in: ${i * 55}ms; 
            --delay-out: ${(regionList.length - 1 - i) * 55}ms`"
          >
            <label :for="item.id" v-if="listOpen">
              <input type="button" :id="item.id" name="select-box" @click="selectOption(item)" />
              <span :style="selectedItem.id == item.id ? 'color: gold;' : ''" v-html="item.value">
              </span>
            </label>
          </transition>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import { regions as regionsJSON } from '../../data/options.json';
import { useMainStore } from '../../store/mainStore';

interface Item {
  id: string;
  value: string;
  name: string;
}

export default defineComponent({
  data() {
    return {
      store: useMainStore(),
      selectedItemIndex: 0,
      listOpen: false
    };
  },

  setup() {
    let buttonRef: Ref<HTMLButtonElement | null> = ref(null);

    return {
      buttonRef
    };
  },

  watch: {
    'store.region.id': {
      handler(regionId) {
        this.selectedItemIndex = this.regionList.findIndex((reg) => reg.id == regionId);
      }
    },
    '$route.query.region': {
      immediate: true,
      handler(regionQuery: string) {
        if (regionQuery) {
          this.store.region =
            regionsJSON.find(
              (reg) =>
                reg.id == regionQuery.toLocaleLowerCase() ||
                reg.value.toLocaleLowerCase() == regionQuery.toLocaleLowerCase()
            ) ?? regionsJSON[0];
        }
      }
    }
  },

  computed: {
    selectedItem() {
      return this.regionList[this.selectedItemIndex] || null;
    },

    regionList() {
      return regionsJSON.map((region) => {
        const regionStationCount = this.store.activeSceneryList.filter(
          (scenery) => scenery.region == region.id && scenery.dispatcherId != -1
        ).length;

        const regionTrainCount =
          this.store.trainList.filter((train) => train.region == region.id).length || 0;

        return {
          id: region.id,
          value: `${region.value} <div class='text--grayed'>${regionStationCount} / ${regionTrainCount}</div>`,
          name: region.name
        };
      });
    }
  },

  methods: {
    selectOption(selectedRegion: Item) {
      this.store.region = selectedRegion;
      this.listOpen = false;
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

.region-dropdown {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

button img {
  vertical-align: middle;
  width: 1.35em;
}

button.selected-region {
  display: flex;
  justify-content: space-between;
  color: paleturquoise;

  font-weight: bold;

  &:focus {
    background-color: #262626;
  }
}

.content {
  position: relative;
  margin: 0 auto;
  font-weight: bold;

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
    width: 100%;
    padding: 0.5em 0;
    position: relative;

    display: inline-block;
    background-color: #262626f2;

    &:hover,
    &:focus {
      background-color: #333333f2;
    }

    cursor: pointer;
  }
}

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
</style>
