<template>
  <div class="train-table">
    <div class="no-trains" v-if="computedTrains.length == 0">Ups! Brak pociągów do wyświetlenia :/</div>

    <ul class="train-list">
      <li
        class="train-item"
        v-for="(train, i) in computedTrains"
        :key="i"
        :id="train.timetableData.timetableId"
        @click="() => {changeFocusedTrain(train.trainNo);}"
      >
        <span class="train-info">
          <span class="info">
            <div class="info-top">
              <div class="info-category">
                <span>
                  <strong>{{ train.timetableData.category }}</strong>
                  {{ train.trainNo }} |
                  <span
                    style=" color: gold;"
                  >{{ train.timetableData.routeDistance }} km</span>
                </span>

                <span>
                  <span class="warning twr" v-if="train.timetableData.TWR">TWR</span>
                  <span class="warning skr" v-if="train.timetableData.SKR">SKR</span>
                </span>
              </div>

              <div class="info-route">
                <strong>
                  {{
                  train.timetableData.route.replace("|", " - ")
                  }}
                </strong>
              </div>

              <div class="info-stations">
                <span v-if="train.timetableData.followingStops.length > 2">
                  Przez:
                  <span v-html="generateStopList(train.timetableData.followingStops)"></span>
                </span>
              </div>
            </div>

            <div class="info-bottom">
              <span
                class="info-online"
                :class="{'online': train.online}"
              >{{train.online ? "ONLINE" : "OFFLINE"}}</span>

              <button class="button">SZCZEGÓŁOWY ROZKŁAD</button>
            </div>
          </span>

          <span class="driver">
            <span class="driver-name">
              <a
                :href="'https://td2.info.pl/profile/?u=' + train.driverId"
                target="_blank"
              >{{ train.driverName }}</a>
              <span style="color: #bbb; margin-left: 1em;">
                {{
                train.locoType
                }}
              </span>
            </span>
            <span class="driver-loco">
              <img :src="train.locoURL" @error="onImageError" />
            </span>
          </span>

          <span class="stats">
            <div class="stats-general">
              <span class="stat mass">
                <img :src="massIcon" alt="icon-mass" />
                {{ train.mass / 1000 }}t
              </span>

              <span class="stat speed">
                <img :src="speedIcon" alt="icon-speed" />
                {{ train.speed }} km/h
              </span>

              <span class="stat length">
                <img :src="lengthIcon" alt="icon-length" />
                {{ train.length }}m
              </span>
            </div>

            <div class="stats-position">
              <span class="stat station">
                <div class="stat-icon">
                  <img :src="sceneryIcon" alt="icon-scenery" />
                </div>
                {{ train.currentStationName || "---" }}
              </span>
              <span class="stat track">
                <div class="stat-icon">
                  <img :src="routeIcon" alt="icon-scenery" />
                </div>
                {{ train.connectedTrack || "---" }}
              </span>
              <span class="stat signal">
                <div class="stat-icon">
                  <img :src="signalIcon" alt="icon-scenery" />
                </div>
                {{ train.signal || "---" }}
              </span>
              <span class="stat distance">
                <div class="stat-icon">
                  <img :src="distanceIcon" alt="icon-scenery" />
                </div>
                {{ train.distance || "0" }}m
              </span>
            </div>
          </span>
        </span>

        <TrainSchedule
          :followingStops="train.timetableData.followingStops"
          :currentStationName="train.currentStationName"
          @click="changeScheduleShowState(train.timetableData.timetableId)"
          v-if="showedSchedule == train.timetableData.timetableId"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

const unknownTrainImage = require("@/assets/unknown.png");

import Train from "@/scripts/interfaces/Train";
import Station from "@/scripts/interfaces/Station";

import TrainSchedule from "@/components/TrainsView/TrainSchedule.vue";

@Component({
  components: { TrainSchedule }
})
export default class TrainTable extends Vue {
  @Prop() computedTrains!: Train[];

  showedSchedule = 0;

  speedIcon: string = require("@/assets/icon-speed.svg");
  massIcon: string = require("@/assets/icon-mass.svg");
  lengthIcon: string = require("@/assets/icon-length.svg");

  distanceIcon: string = require("@/assets/icon-distance.svg");
  sceneryIcon: string = require("@/assets/icon-scenery.svg");
  signalIcon: string = require("@/assets/icon-signal.svg");
  routeIcon: string = require("@/assets/icon-route.svg");

  changeScheduleShowState(timetableId: number) {
    this.showedSchedule = timetableId;
  }

  onImageError(e: Event) {
    (e.target as HTMLImageElement).src = unknownTrainImage;
  }

  generateStopList(stops: any): string | undefined {
    if (!stops) return "";
    return stops.reduce((acc, stop, i) => {

      if (stop.stopType.includes("ph")) acc.push(`<strong>${stop.stopName}</strong>`);
      else if (i > 0 && i < stops.length - 1 && !stop.stopName.includes("po."))
        acc.push(`<span style='color: #ccc;'>${stop.stopName.includes("podg.") ? stop.stopName.split(",")[0] : stop.stopName}</span>`);
      return acc;
    }, []).join(" * ");
  }

  changeFocusedTrain(trainNo: number) {
    this.$emit('changeFocusedTrain', trainNo.toString());
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";
@import "../../styles/variables.scss";

.no-trains {
  text-align: center;
  font-size: 1.5em;

  padding: 1rem;
  margin: 1rem 0;

  background: #333;
}

.train {
  &-list {
    overflow: auto;

    @include smallScreen() {
      width: 100%;
    }
  }

  &-item {
    padding: 1rem;
    margin-bottom: 1rem;

    background-color: #383838;

    cursor: pointer;
  }
}

.train-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  font-size: calc(0.4rem + 0.5vw);

  @include smallScreen() {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, minmax(100px, 1fr));

    font-size: 0.8rem;
    gap: 0.4em 0;
  }

  @include bigScreen() {
    font-size: 1.1rem;
  }
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &-category {
    flex-grow: 2;
    font-size: 1.05em;

    display: flex;
    justify-content: space-between;
  }

  &-route {
    width: 100%;
    font-size: 1.2em;
  }

  &-stations {
    margin-top: 0.35em;
    margin-bottom: 1rem;

    font-size: 0.75em;
  }

  &-online {
    background-color: #ce0000;

    padding: 0.2em 0.7em;
    font-size: 0.85em;

    border-radius: 1em;

    &.online {
      background-color: #009700;
    }
  }

  &-bottom {
    display: flex;
    align-items: center;

    button {
      margin-left: 10px;
      background: #144e75;
      border-radius: 1em;
      padding: 0.2em 0.5em;
      font-size: 0.85em;
    }
  }
}

.driver {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  &-exp {
    font-size: 1.4em;
    padding: 0.3em 0.6em;

    border-radius: 0.4em;

    background-color: red;
  }

  &-name {
    margin: 0 0.3em;
  }

  &-loco {
    width: 100%;
    text-align: center;
  }

  &-loco img {
    width: 13em;
    max-width: 190px;
  }
}

.stats {
  &-general {
    display: flex;
    margin-bottom: 1.5em;

    & > .stat {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 100%;
    }

    img {
      margin: 0 0.3em;
      width: 2em;
    }
  }

  &-position {
    display: flex;

    margin-top: 1em;
    text-align: center;

    font-size: 0.9em;

    p {
      color: #00cff3;
    }

    & > .stat {
      width: 100%;

      img {
        width: 2em;
      }
    }
  }
}

.warning {
  border-radius: 1em;
  padding: 0.1em 1.2em;
  margin: 0 0.2em;

  color: black;
  font-weight: bold;
  font-size: 0.85em;

  &.twr {
    background-color: $twr;
  }

  &.skr {
    background-color: $skr;
    color: white;
  }
}

@include bigScreen() {
  .item {
    font-size: 1rem;
  }
}

@include smallScreen() {
  .info-bottom {
    text-align: center;
  }
}
</style>