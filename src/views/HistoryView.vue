<template>
  <div class="history_view">
    <div class="history_wrapper">
      <div class="header">
        <h2>DZIENNIK AKTYWNOŚCI SCENERII</h2>
        <p style="color: #ccc;">Pokazuje dyżurnych, którzy ostatnio byli aktywni na wybranej scenerii</p>
      </div>

      <div class="search-box">
        <div class="search-box_content">
          <label :class="{ disabled: dataLoading }">
            <select v-model="inputStationName" :disabled="dataLoading">
              <option value disabled selected hidden>{{ dataLoading ? 'Pobieranie danych...' : 'Wybierz scenerię' }}</option>
              <option v-for="(station) in filteredStationList" :key="station" :value="station">{{ station }}</option>
            </select>
          </label>
        </div>
      </div>

      <div class="disclaimer">
        <h4>Ta funkcjonalność jest w testach beta!</h4>
        <p>Informacje pokazywane na ekranie mogą znikać, a ich zawartość może być fałszywa!</p>
      </div>

      <div class="list">
        <div class="list_wrapper">
          <!-- <div class="list_loading" v-if="dataLoading">POBIERANIE DANYCH...</div> -->
          <transition name="list-anim" mode="out-in">
            <ul class="list_content" v-if="!dataLoading && computedHistoryList.length != 0" :key="inputStationName">
              <li v-if="currentDispatcherFrom != -1" class="current">
                <div class="dispatcher-name">
                  <a :href="`https://td2.info.pl/profile/?u=${currentDispatcherId}`">{{ currentDispatcher}}</a>
                </div>
                <div class="dispatcher-date">
                  <span style="color: #bbb">{{ new Date(currentDispatcherFrom).toLocaleDateString('pl-PL') }}</span>
                  {{ new Date(currentDispatcherFrom).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}}
                </div>
              </li>

              <li v-for="(history, i) in computedHistoryList" :key="i">
                <div class="dispatcher-name">
                  <a :href="`https://td2.info.pl/profile/?u=${history.dispatcherId}`">{{ history.dispatcherName }}</a>
                </div>
                <div class="dispatcher-date">
                  <div>
                    <span style="color: #888">{{history.dispatcherFromDate }}</span>
                    {{ history.dispatcherFromTime }}
                  </div>
                  <div>
                    <span style="color: #888">{{ history.dispatcherToDate }}</span>
                    {{ history.dispatcherToTime }}
                  </div>
                </div>
              </li>
            </ul>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from "axios";

import { Component, Vue, Watch } from "vue-property-decorator";
import { Getter } from "vuex-class";

import Station from "@/scripts/interfaces/Station";

interface ISceneryHistory {
  _id: string;
  stationHash: string;
  stationName: string;
  currentDispatcher: string;
  currentDispatcherId: number;
  currentDispatcherFrom: number;
  currentDispatcherTo: number;
  dispatcherHistory: {
    dispatcherName: string;
    dispatcherFrom: number;
    dispatcherId: number;
    dispatcherTo: number;
  }[];
}

@Component
export default class HistoryView extends Vue {
  @Getter("getStationList") stationList!: Station[];

  sceneryHistoryList: ISceneryHistory[] = [];

  currentSceneryHistory: ISceneryHistory["dispatcherHistory"] = [];
  currentDispatcher: string = "";
  currentDispatcherId: number = 0;
  currentDispatcherFrom: number = -1;

  inputStationName = "";
  dataLoading = true;

  async mounted() {
    try {
      const responseData: ISceneryHistory[] = await (
        await axios.get(
          "https://stacjownik.herokuapp.com/api/getSceneryHistory"
        )
      ).data;

      this.sceneryHistoryList = responseData;
    } catch (error) {
      console.error(error);
    }

    this.dataLoading = false;
  }

  @Watch("inputStationName")
  onInputChanged(val: string) {
    this.itemSelected(val);
  }

  get filteredStationList() {
    return this.sceneryHistoryList
      .map((station) => station.stationName)
      .sort((a, b) => (a.toLowerCase() >= b.toLowerCase() ? 1 : -1));
  }

  get computedHistoryList() {
    return this.currentSceneryHistory
      .map(
        ({ dispatcherName, dispatcherFrom, dispatcherTo, dispatcherId }) => ({
          dispatcherName,
          dispatcherFrom,
          dispatcherTo,
          dispatcherId,
          dispatcherFromDate: new Date(dispatcherFrom).toLocaleDateString(
            "pl-PL"
          ),
          dispatcherFromTime: new Date(
            dispatcherFrom
          ).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
          dispatcherToDate: new Date(dispatcherTo).toLocaleDateString("pl-PL"),
          dispatcherToTime: new Date(dispatcherTo).toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      )
      .reverse();
  }

  itemSelected(itemName: string) {
    const selectedScenery = this.sceneryHistoryList.find(
      (scenery) => scenery.stationName == itemName
    );

    if (!selectedScenery) return;

    this.currentSceneryHistory = selectedScenery.dispatcherHistory;
    this.currentDispatcher = selectedScenery.currentDispatcher;
    this.currentDispatcherId = selectedScenery.currentDispatcherId;
    this.currentDispatcherFrom = selectedScenery.currentDispatcherFrom;
  }
}
</script>

<style scoped lang="scss">
@import "../styles/responsive.scss";

.history {
  &_view {
    font-size: 1.2em;
    display: flex;
  }

  &_wrapper {
    width: 100%;
    text-align: center;

    margin-top: 1em;
  }
}

.list-anim {
  &-enter-active,
  &-leave-active {
    transition: all 150ms ease-out;
  }

  &-enter,
  &-leave-to {
    opacity: 0.1;
    transform: scale(0.95);
  }

  &-move {
    transition: transform 100ms;
  }
}

.disclaimer {
  color: #aaa;
}

.search-box {
  display: flex;
  justify-content: center;
  align-items: center;

  &_content {
    position: relative;
    margin: 1em 0;
    font-size: 1em;
  }

  select {
    border: none;
    font-size: 1em;

    background-color: rgb(87, 87, 87);
    padding: 0.3em;
    padding-right: 50px;
    outline: none;

    color: white;

    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    cursor: pointer;
  }

  label {
    position: relative;

    &.disabled::after {
      color: gray;
    }

    &::after {
      content: "<>";

      position: absolute;
      top: -5%;
      right: 0.3em;
      font-weight: bold;
    }
  }
}

.list {
  text-align: center;
  margin: 1em 0;

  display: flex;
  justify-content: center;

  &_loading,
  &_no-info {
    margin: 0.3em 0;
    padding: 0.5em 2em;

    color: white;
  }

  &_loading {
    background-color: #b96b11;
  }

  &_no-info {
    background-color: firebrick;
  }

  &_wrapper {
    @include smallScreen() {
      width: 95%;
      font-size: 0.9em;
    }
  }

  &_content {
    max-height: 550px;
    overflow: auto;

    padding: 0.2em 0.5em;
  }

  &_content > li {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    background: #222;
    padding: 0.3em 0.8em;
    margin: 0.3em 0;

    gap: 10em;

    @include smallScreen() {
      gap: 1em;
    }

    & > div {
      margin: 0 1em;
    }

    &.current {
      background: #007200;
    }

    & > .dispatcher-name {
      display: flex;
      justify-content: center;
      align-items: center;

      font-size: 1.1em;
      font-weight: 500;
    }
  }
}
</style>