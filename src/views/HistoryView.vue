<template>
  <section class="history-view">
    <h2>Historia rozkładów jazdy</h2>

    <div style="display: flex; justify-content: center; align-items: center">
      <search-box
        v-model:searchedValue="searchDriver"
        titleToTranslate="history.search-driver"
        :updateOnInput="false"
      ></search-box>

      <search-box
        v-model:searchedValue="searchTrain"
        titleToTranslate="history.search-train"
        :updateOnInput="false"
      ></search-box>
    </div>

    <div class="history_list">
      <ul v-if="historyList">
        <li v-for="item in historyList" :key="item.timetableId">
          <div class="history_item-top">
            <span>
              <span
                @click="
                  () =>
                    !item.terminated ? navigateToTrain(item.trainNo) : null
                "
                style="cursor: pointer"
                >{{ item.trainCategoryCode }} {{ item.trainNo }}</span
              >

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
              <b>Rozpoczęcie:</b>
              {{ new Date(item.beginDate).toLocaleString() }}
            </div>
            <div>
              <b>Zakończenie:</b> {{ new Date(item.endDate).toLocaleString() }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts">
import SearchBox from "@/components/Global/SearchBox.vue";
import axios from "axios";
import { computed, defineComponent, Ref, ref } from "vue";

const API_URL =
  "https://stacjownik-api-m9z4k.ondigitalocean.app/api/getTimetables?count=15";

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

async function fetchData(): Promise<TimetableHistory[] | null> {
  const responseData: APIResponse | null = await (
    await axios.get(API_URL)
  ).data;

  return responseData?.response || null;
}

export default defineComponent({
  components: { SearchBox },
  setup() {
    // const historyList = computed(async () => await fetchData());
    const historyList: Ref<TimetableHistory[] | null> = ref([]);
    const searchDriver = ref("");
    const searchTrain = ref("");

    (async () => {
      const response = await fetchData();

      historyList.value = response;

      console.log(response);
    })();

    return {
      historyList,
      searchDriver,
      searchTrain,
    };
  },
  methods: {
    navigateToTrain(trainNo: number) {
      this.$router.push({
        name: "TrainsView",
        params: { queryTrain: trainNo.toString() },
      });
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
  width: 800px;
}

li {
  background: #202020;
  padding: 1em;
  margin: 1em 0;
}
</style>