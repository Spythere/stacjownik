<template>
  <div class="history_view">
    <div class="history_wrapper">
      <div class="history_dropdown">
        <div class="history_title title">Wybierz scenerię</div>
        <Dropdown :itemList="sortedList" @itemSelected="itemSelected" />
      </div>

      <div class="history_content">
        <div class="history_station-name title">DZIENNIK RUCHU DLA SCENERII ALEKSANDRÓW KUJAWSKI</div>
        <div class="list_wrapper">
          <ul class="history_list">
            <li v-for="(history, i) in currentSceneryHistory" :key="i">
              <div class="history_dispatcher">{{history.dispatcherName }}</div>
              <div class="history_from">
                <span
                  style="color: #888"
                >{{ new Date(history.dispatcherFrom).toLocaleDateString('pl-PL') }}</span>
                {{ new Date(history.dispatcherFrom).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}}
              </div>
              <div>-</div>
              <div class="history_to">
                <span
                  style="color: #888"
                >{{ new Date(history.dispatcherTo).toLocaleDateString('pl-PL') }}</span>
                {{ new Date(history.dispatcherTo).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}}
              </div>
            </li>

            <li v-if="currentDispatcherFrom != -1" class="current">
              <div class="history_dispatcher">{{ currentDispatcher }}</div>
              <div class="history_from">
                DYŻURUJE OD:
                <span
                  style="color: #bbb"
                >{{ new Date(currentDispatcherFrom).toLocaleDateString('pl-PL') }}</span>
                {{ new Date(currentDispatcherFrom).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from "axios";

import { Component, Vue } from "vue-property-decorator";
import { Getter } from "vuex-class";
import Dropdown from "@/components/Global/Dropdown.vue";

import Station from "@/scripts/interfaces/Station";

interface ISceneryHistory {
  _id: string;
  stationHash: string;
  stationName: string;
  currentDispatcher: string;
  currentDispatcherId: string;
  currentDispatcherFrom: number;
  currentDispatcherTo: number;
  dispatcherHistory: {
    dispatcherName: string;
    dispatcherFrom: number;
    dispatcherTo: number;
  }[];
}

@Component({
  components: {
    Dropdown,
  },
})
export default class HistoryView extends Vue {
  @Getter("getStationList") stationList!: Station[];

  currentSceneryHistory: ISceneryHistory["dispatcherHistory"] = [];
  currentDispatcher: string = "";
  currentDispatcherFrom: number = -1;

  get sortedList() {
    return this.stationList
      .map((v) => v.stationName)
      .sort((a, b) => (a.toLowerCase() >= b.toLowerCase() ? 1 : -1));
  }

  async itemSelected(itemName: string) {
    try {
      const responseData: ISceneryHistory = await (
        await axios.get(
          `https://stacjownik.herokuapp.com/api/getSceneryHistory?name=${itemName.replaceAll(
            " ",
            "_"
          )}`
        )
      ).data;

      this.currentSceneryHistory = responseData.dispatcherHistory;
      this.currentDispatcher = responseData.currentDispatcher;
      this.currentDispatcherFrom = responseData.currentDispatcherFrom;
    } catch (error) {
      this.currentSceneryHistory = [];
    }
  }
}
</script>

<style scoped lang="scss">
.history {
  &_view {
    font-size: 1.5em;

    display: flex;
  }

  &_title {
    text-align: center;
    font-size: 1.2em;
  }

  &_wrapper {
    width: 100%;
  }

  &_dropdown {
    display: flex;
    justify-content: center;
    align-items: center;

    flex-direction: column;
  }

  &_content {
    text-align: center;

    margin-top: 1em;
  }

  &_list {
    min-width: 45%;
  }

  &_list > li {
    display: flex;
    justify-content: center;

    background: #222;
    padding: 0.5em 0.3em;
    margin: 0.3em 0;

    & > div {
      margin: 0 0.5em;
    }

    &.current {
      background: #007200;
    }
  }
}

.list_wrapper {
  display: flex;
  justify-content: center;
}
</style>