<template>
  <section class="history-view">
    <h2>Historia rozkładów jazdy</h2>

    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
      "
    >
      <search-box
        v-model:searchedValue="searchedDriver"
        titleToTranslate="history.search-driver"
        @clearValue="clearDriver"
        @keypress="keyPressed"
      ></search-box>

      <search-box
        v-model:searchedValue="searchedTrain"
        titleToTranslate="history.search-train"
        @clearValue="clearTrain"
        @keypress="keyPressed"
      ></search-box>

      <action-button @click="search" style="margin-left: 0.5em">
        Szukaj
      </action-button>
    </div>

    <div class="history_list">
      <transition-group name="list" tag="ul">
        <li v-for="(item, i) in historyList" :key="i">
          <div class="history_item-top">
            <span>
              <span
                @click="
                  () =>
                    !item.terminated ? navigateToTrain(item.trainNo) : null
                "
                style="cursor: pointer"
              >
                {{ item.trainCategoryCode }} {{ item.trainNo }}
              </span>

              <div>
                <b>{{ item.route.replace("|", " - ") }}</b>
              </div>
            </span>

            <span
              class="history_item-status"
              :class="{
                fulfilled: item.fulfilled,
                terminated: item.terminated && !item.fulfilled,
                active: !item.terminated,
              }"
            >
              {{
                !item.terminated
                  ? "AKTYWNY"
                  : item.fulfilled
                  ? "WYPEŁNIONY"
                  : "NIEWYPEŁNIONY"
              }}
            </span>
          </div>

          <div style="margin: 1em 0">
            <div><b>Maszynista:</b> {{ item.driverName }}</div>
            <div>
              <b>Kilometraż:</b>
              {{ !item.fulfilled ? item.currentDistance + " /" : "" }}
              {{ item.routeDistance }} km
            </div>

            <div>
              <b>Stacje:</b>
              {{ item.confirmedStopsCount }} /
              {{ item.allStopsCount }}
            </div>

            <div>
              <b>Rozpoczęcie:</b>
              {{ localeDate(item.beginDate) }}
            </div>

            <div><b>Zakończenie:</b> {{ localeDate(item.endDate) }}</div>
          </div>
        </li>
      </transition-group>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from "vue";
import axios from "axios";

import ActionButton from "@/components/Global/ActionButton.vue";
import SearchBox from "@/components/Global/SearchBox.vue";
import dateMixin from "@/mixins/dateMixin";

const API_URL =
  "https://stacjownik-api-m9z4k.ondigitalocean.app/api/getTimetables";

interface APIResponse {
  errorMessage: string | null;
  response: TimetableHistory[] | null;
}

interface TimetableHistory {
  timetableId: number;
  trainNo: number;
  trainCategoryCode: string;
  driverId: number;
  driverName: string;
  route: string;
  twr: number;
  skr: number;
  sceneries: string[];

  routeDistance: number;
  currentDistance: number;

  confirmedStopsCount: number;
  allStopsCount: number;

  beginDate: string;
  endDate: string;

  terminated: boolean;
  fulfilled: boolean;
}

async function fetchData(props: {
  searchedDriver?: string;
  searchedTrain?: string;
  maxCount?: number;
}): Promise<TimetableHistory[] | null> {
  const queries: string[] = [];

  if (!props.searchedDriver && !props.searchedTrain) queries.push("count=15");
  if (props.maxCount) queries.push(`count=${props.maxCount}`);
  if (props.searchedDriver) queries.push(`driver=${props.searchedDriver}`);
  if (props.searchedTrain) queries.push(`train=${props.searchedTrain}`);

  const responseData: APIResponse | null = await (
    await axios.get(`${API_URL}?${queries.join("&")}`)
  ).data;

  return responseData?.response || null;
}

export default defineComponent({
  components: { SearchBox, ActionButton },
  mixins: [dateMixin],
  setup() {
    const historyList: Ref<TimetableHistory[]> = ref([]);
    const searchedDriver = ref("");
    const searchedTrain = ref("");
    const maxCount = ref(15);

    (async () => {
      const response = await fetchData({});

      if (response) historyList.value = response;
    })();

    return {
      historyList,
      searchedDriver,
      searchedTrain,
      maxCount,
    };
  },
  methods: {
    navigateToTrain(trainNo: number) {
      this.$router.push({
        name: "TrainsView",
        params: { queryTrain: trainNo.toString() },
      });
    },

    clearDriver() {
      this.searchedDriver = "";

      this.search();
    },

    clearTrain() {
      this.searchedTrain = "";

      this.search();
    },

    async search() {
      const response = await fetchData({
        searchedDriver: this.searchedDriver,
        searchedTrain: this.searchedTrain,
      });

      if (response) this.historyList = response;
    },

    keyPressed({ keyCode }) {
      if (keyCode == 13) this.search();
    },
  },
});
</script>

<style lang="scss" scoped>
.history-view {
  /* min-height: 100vh; */
  height: 100%;

  padding: 2em;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
}

h3 {
  text-align: center;
}

.history_list {
  display: flex;
  justify-content: center;
}

.history_item {
  &-top {
    display: flex;
    justify-content: space-between;

    padding: 0.2em 0;
  }

  &-status {
    &.terminated {
      color: salmon;
    }

    &.fulfilled {
      color: lightgreen;
    }

    &.active {
      color: lightblue;
    }
  }
}

ul {
  width: 1000px;
}

li {
  background: #202020;
  padding: 1em;
  margin: 1em 0;
}

.list-enter-active,
.list-leave-active {
  transition: all 350ms ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
  /* transform: translateX(30px); */
}

.list-enter-to,
.list-leave-from {
  opacity: 1;
}
</style>