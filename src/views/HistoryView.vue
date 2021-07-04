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
      <div class="list_wrapper">
        <transition name="warning" mode="out-in">
          <div :key="historyDataStatus.status">
            <div v-if="isDataLoading" class="history_warning">Ładowanie...</div>

            <div
              v-if="!isDataLoading && isDataError"
              class="history_warning error"
            >
              Wystąpił błąd!
            </div>

            <div
              class="history_warning"
              v-if="!isDataLoading && !isDataError && historyList.length == 0"
            >
              Brak wyników!
            </div>

            <ul v-if="!isDataLoading && !isDataError">
              <li
                v-for="(item, i) in historyList"
                :key="item.timetableId"
                :style="`--delay: ${i * 50}ms`"
              >
                <div class="history_item-top">
                  <span>
                    <span
                      @click="
                        navigateToTrain(!item.terminated ? item.trainNo : null)
                      "
                      style="cursor: pointer"
                    >
                      <b class="text--primary">{{ item.trainCategoryCode }}</b>
                      {{ item.trainNo }}
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
                  <div>
                    <b>Maszynista:</b>
                    {{ item.driverName }}
                  </div>
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

                  <div>
                    <b>Zakończenie:</b>
                    {{ localeDate(item.endDate) }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from "vue";
import axios from "axios";

import ActionButton from "@/components/Global/ActionButton.vue";
import SearchBox from "@/components/Global/SearchBox.vue";
import dateMixin from "@/mixins/dateMixin";
import { DataStatus } from "@/scripts/enums/DataStatus";

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

export default defineComponent({
  components: { SearchBox, ActionButton },
  mixins: [dateMixin],
  setup() {
    const historyList: Ref<TimetableHistory[]> = ref([]);
    const historyDataStatus: Ref<{ status: DataStatus; error: string | null }> =
      ref({ status: DataStatus.Loading, error: null });

    const searchedDriver = ref("");
    const searchedTrain = ref("");
    const maxCount = ref(15);

    const fetchHistoryData = async (
      props: {
        searchedDriver?: string;
        searchedTrain?: string;
        maxCount?: number;
      } = {}
    ) => {
      historyDataStatus.value.status = DataStatus.Loading;

      const queries: string[] = [];

      if (!props.searchedDriver && !props.searchedTrain)
        queries.push("count=15");
      if (props.maxCount) queries.push(`count=${props.maxCount}`);
      if (props.searchedDriver) queries.push(`driver=${props.searchedDriver}`);
      if (props.searchedTrain) queries.push(`train=${props.searchedTrain}`);

      try {
        const responseData: APIResponse | null = await (
          await axios.get(`${API_URL}?${queries.join("&")}`)
        ).data;

        if (!responseData) {
          historyDataStatus.value.status = DataStatus.Error;
          historyDataStatus.value.error = "Brak danych!";
          return;
        }

        if (responseData.errorMessage) {
          historyDataStatus.value.status = DataStatus.Error;
          historyDataStatus.value.error = responseData.errorMessage;

          return;
        }

        if (!responseData.response) return;

        // Response data exists
        historyList.value = responseData.response;
        historyDataStatus.value.status = DataStatus.Loaded;
      } catch (error) {
        historyDataStatus.value.status = DataStatus.Error;
        historyDataStatus.value.error = "Ups! Coś poszło nie tak!";
      }
    };

    // on created
    fetchHistoryData();

    return {
      historyList,
      searchedDriver,
      searchedTrain,
      maxCount,
      fetchHistoryData,
      historyDataStatus,
      isDataLoading: computed(
        () => historyDataStatus.value.status === DataStatus.Loading
      ),
      isDataError: computed(
        () => historyDataStatus.value.status === DataStatus.Error
      ),
    };
  },
  methods: {
    navigateToTrain(trainNo: number | null) {
      if (!trainNo) return;

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
      this.fetchHistoryData({
        searchedDriver: this.searchedDriver,
        searchedTrain: this.searchedTrain,
      });
    },

    keyPressed({ keyCode }) {
      if (keyCode == 13) this.search();
    },
  },
});
</script>

<style lang="scss" scoped>
.warning {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active {
    transition: all 100ms ease-out;
  }

  &-leave-active {
    transition: all 100ms ease-out 100ms;
  }
}

.history-view {
  height: 100%;

  padding: 2em;
}

h2 {
  text-align: center;
  margin-bottom: 1rem;
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

.history_warning {
  text-align: center;
  font-size: 1.3em;

  &.error {
    background-color: var(--clr-error);
  }
}

.list_wrapper {
  width: 1000px;
}

li,
.history_warning {
  background: #202020;
  padding: 1em;
  margin: 1em 0;
}
</style>