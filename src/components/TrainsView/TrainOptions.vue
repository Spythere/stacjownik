<template>
  <div class="train-options">
    <div class="options_wrapper">
      <select-box
        :title="$t('trains.option-distance')"
        :itemList="translatedSorterOptions"
        :defaultItemIndex="3"
        @selected="changeSorter"
      />

      <div class="search-box">
        <input
          class="search-input"
          v-model="searchedTrain"
          :placeholder="$t('trains.search-no')"
        />

        <img
          class="search-exit"
          :src="exitIcon"
          alt="exit-icon"
          @click="() => (searchedTrain = '')"
        />
      </div>

      <div class="search-box">
        <input
          class="search-input"
          v-model="searchedDriver"
          :placeholder="$t('trains.search-driver')"
        />

        <img
          class="search-exit"
          :src="exitIcon"
          alt="exit-icon"
          @click="() => (searchedDriver = '')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import SelectBox from "../Global/SelectBox.vue";

export default defineComponent({
  components: { SelectBox },
  props: ["queryTrain"],
  emits: ["changeSearchedTrain", "changeSearchedDriver", "changeSorter"],

  data: () => ({
    exitIcon: require("@/assets/icon-exit.svg"),
    searchedTrain: "",
    searchedDriver: "",
  }),

  setup() {
    const { t } = useI18n();

    const sorterOptions = [
      {
        id: "mass",
        value: "masa",
      },
      {
        id: "speed",
        value: "prędkość",
      },
      {
        id: "length",
        value: "długość",
      },
      {
        id: "distance",
        value: "kilometraż",
      },
      {
        id: "timetable",
        value: "numer pociągu",
      },
    ];

    const translatedSorterOptions = computed(() =>
      sorterOptions.map(({ id }) => ({
        id,
        value: t(`trains.option-${id}`),
      }))
    );

    return {
      translatedSorterOptions,
    };
  },

  mounted() {
    if (this.queryTrain) {
      this.searchedTrain = this.queryTrain;
      this.searchedDriver = "";
    }
  },

  methods: {
    chooseTrain(train: string) {
      this.$emit("changeSearchedTrain", train);
    },

    chooseDriver(driverName: string) {
      this.$emit("changeSearchedDriver", driverName);
    },

    changeSorter(item: { id: string | number; value: string }) {
      this.$emit("changeSorter", { id: item.id, dir: -1 });
    },
  },

  watch: {
    searchedTrain(value: string) {
      this.chooseTrain(value);
    },

    searchedDriver(value: string) {
      this.chooseDriver(value);
    },

    queryTrain(train: string) {
      if (!train) return;
      if (train == "") return;

      this.searchedTrain = train;
      this.searchedDriver = "";
    },
  },
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";

.train-options {
  @include smallScreen() {
    width: 100%;
  }
}

.options_wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  margin-bottom: 0.5em;

  @include smallScreen() {
    justify-content: center;
    flex-direction: column;
  }
}

.select-box {
  margin: 0.5em 0;
}

.search {
  &-box {
    position: relative;

    background: #333;
    border-radius: 0.5em;
    min-width: 200px;

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