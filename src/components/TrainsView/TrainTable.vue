<template>
  <div class="train-table">
    <div class="no-trains" v-if="computedTrains.length == 0 && timetableLoaded">
      {{ $t("trains.no-trains") }}
    </div>

    <div
      class="no-trains"
      v-if="computedTrains.length == 0 && !timetableLoaded"
    >
      {{ $t("trains.loading") }}
    </div>

    <ul class="train-list">
      <li
        class="train-row"
        v-for="(train, i) in computedTrains"
        :key="i"
        :ref="train.timetableData ? train.timetableData.timetableId : -1"
      >
        <div class="wrapper no-timetable" v-if="!train.timetableData">
          <span class="info">
            <div class="info-main">
              <div class="info-top">
                <div class="top-category">
                  <span>
                    {{ train.trainNo }} |
                    <span style="color: gold">
                      {{ $t("trains.no-timetable") }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </span>

          <span class="driver">
            <div class="driver-info">
              <span class="driver-name">
                <a
                  :href="'https://td2.info.pl/profile/?u=' + train.driverId"
                  target="_blank"
                >
                  {{ train.driverName }}
                </a>
              </span>
              <span class="driver-type">
                {{ train.locoType }}
              </span>
            </div>

            <span class="driver-loco">
              <img
                v-if="!missingLocoImages.includes(train.locoURL)"
                :src="train.locoURL"
                @error="onImageError"
              />

              <img v-else :src="defaultLocoImage" alt="unknown-train" />
            </span>
          </span>

          <span class="stats">
            <div class="stats-main">
              <span class="mass">
                <img :src="massIcon" alt="icon-mass" />
                {{ train.mass / 1000 }}t
              </span>

              <span class="speed">
                <img :src="speedIcon" alt="icon-speed" />
                {{ train.speed }} km/h
              </span>

              <span class="length">
                <img :src="lengthIcon" alt="icon-length" />
                {{ train.length }}m
              </span>
            </div>

            <div class="stats-position">
              <span class="station">
                <div class="stat-icon">
                  <img :src="sceneryIcon" alt="icon-scenery" />
                </div>
                {{ train.currentStationName || "---" }}
              </span>
              <span class="track">
                <div class="stat-icon">
                  <img :src="routeIcon" alt="icon-scenery" />
                </div>
                {{ train.connectedTrack || "---" }}
              </span>
              <span class="signal">
                <div class="stat-icon">
                  <img :src="signalIcon" alt="icon-scenery" />
                </div>
                {{ train.signal || "---" }}
              </span>
              <span class="distance">
                <div class="stat-icon">
                  <img :src="distanceIcon" alt="icon-scenery" />
                </div>
                {{ train.distance || "0" }}m
              </span>
            </div>
          </span>
        </div>

        <div
          v-else
          class="wrapper"
          @click="changeScheduleShowState(train.timetableData.timetableId)"
        >
          <span class="info">
            <div class="info-main">
              <div class="info-top">
                <div class="top-category">
                  <span class="warning twr" v-if="train.timetableData.TWR">
                    TWR
                  </span>

                  <span class="warning skr" v-if="train.timetableData.SKR">
                    SKR
                  </span>

                  <span>
                    <strong>{{ train.timetableData.category }}</strong>
                    {{ train.trainNo }} |

                    <span style="color: gold">
                      {{ train.timetableData.routeDistance }} km
                    </span>
                  </span>
                </div>

                <div class="top-timetable-btn tooltip">
                  <img
                    :src="
                      showedSchedule === train.timetableData.timetableId
                        ? ascSVG
                        : descSVG
                    "
                    alt="asc-arrow"
                  />

                  <span>SRJP</span>

                  <span class="tooltip-text">
                    {{ $t("trains.detailed-timetable") }} {{ train.trainNo }}
                  </span>
                </div>
              </div>

              <div class="info-route">
                <span class="info-route-text">
                  <strong>
                    {{ train.timetableData.route.replace("|", " - ") }}
                  </strong>
                </span>
              </div>

              <div class="info-stops">
                <span v-if="train.timetableData.followingStops.length > 2">
                  {{ $t("trains.via-title") }}

                  <span
                    v-html="
                      generateStopList(train.timetableData.followingStops)
                    "
                  ></span>
                </span>
              </div>
            </div>
          </span>

          <span class="driver">
            <div class="driver-info">
              <span class="driver-name">
                <a
                  :href="'https://td2.info.pl/profile/?u=' + train.driverId"
                  target="_blank"
                >
                  {{ train.driverName }}
                </a>
              </span>
              <span class="driver-type">
                {{ train.locoType }}
              </span>
            </div>

            <span class="driver-loco">
              <img
                v-if="!missingLocoImages.includes(train.locoURL)"
                :src="train.locoURL"
                @error="onImageError"
              />

              <img v-else :src="defaultLocoImage" alt="unknown-train" />
            </span>
          </span>

          <span class="stats">
            <div class="stats-main">
              <span class="mass">
                <img :src="massIcon" alt="icon-mass" />
                {{ train.mass / 1000 }}t
              </span>

              <span class="speed">
                <img :src="speedIcon" alt="icon-speed" />
                {{ train.speed }} km/h
              </span>

              <span class="length">
                <img :src="lengthIcon" alt="icon-length" />
                {{ train.length }}m
              </span>
            </div>

            <div class="stats-position">
              <span class="station">
                <div class="stat-icon">
                  <img :src="sceneryIcon" alt="icon-scenery" />
                </div>
                {{ train.currentStationName || "---" }}
              </span>
              <span class="track">
                <div class="stat-icon">
                  <img :src="routeIcon" alt="icon-scenery" />
                </div>
                {{ train.connectedTrack || "---" }}
              </span>
              <span class="signal">
                <div class="stat-icon">
                  <img :src="signalIcon" alt="icon-scenery" />
                </div>
                {{ train.signal || "---" }}
              </span>
              <span class="distance">
                <div class="stat-icon">
                  <img :src="distanceIcon" alt="icon-scenery" />
                </div>
                {{ train.distance || "0" }}m
              </span>
            </div>
          </span>
        </div>

        <TrainSchedule
          v-if="train.timetableData"
          :followingStops="train.timetableData.followingStops"
          :currentStationName="train.currentStationName"
          @click="changeScheduleShowState(train.timetableData.timetableId)"
          v-show="showedSchedule == train.timetableData.timetableId"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import Train from "@/scripts/interfaces/Train";

import TrainSchedule from "@/components/TrainsView/TrainSchedule.vue";
import TrainStop from "@/scripts/interfaces/TrainStop";
import { DataStatus } from "@/scripts/enums/DataStatus";

@Component({
  components: { TrainSchedule },
})
export default class TrainTable extends Vue {
  @Prop() computedTrains!: Train[];
  @Prop() timetableDataStatus!: DataStatus;

  showedSchedule = 0;

  missingLocoImages: string[] = [];

  defaultLocoImage = require("@/assets/unknown.png");

  ascSVG = require("@/assets/icon-arrow-asc.svg");
  descSVG = require("@/assets/icon-arrow-desc.svg");

  speedIcon: string = require("@/assets/icon-speed.svg");
  massIcon: string = require("@/assets/icon-mass.svg");
  lengthIcon: string = require("@/assets/icon-length.svg");

  distanceIcon: string = require("@/assets/icon-distance.svg");
  sceneryIcon: string = require("@/assets/icon-scenery.svg");
  signalIcon: string = require("@/assets/icon-signal.svg");
  routeIcon: string = require("@/assets/icon-route.svg");

  get timetableLoaded() {
    return this.timetableDataStatus == DataStatus.Loaded;
  }

  get timetableError() {
    return this.timetableDataStatus == DataStatus.Error;
  }

  changeScheduleShowState(elementId: number) {
    if (elementId < 0) return;

    this.showedSchedule = this.showedSchedule == elementId ? 0 : elementId;

    this.$nextTick(() => {
      const currentEl: HTMLElement = this.$refs[elementId][0];

      console.log(currentEl);

      currentEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }

  onImageError(e: Event) {
    const imageEl = e.target as HTMLImageElement;
    this.missingLocoImages.push(imageEl.src);
  }

  generateStopList(stops: any): string | undefined {
    if (!stops) return "";
    return stops
      .reduce((acc, stop: TrainStop, i) => {
        if (stop.stopType.includes("ph"))
          acc.push(
            `<strong style='color:${
              stop.confirmed ? "springgreen" : "white"
            }'>${stop.stopName}</strong>`
          );
        else if (
          i > 0 &&
          i < stops.length - 1 &&
          !stop.stopNameRAW.includes("po.") &&
          !stop.stopNameRAW.includes("SBL")
        )
          acc.push(
            `<span style='color:${
              stop.confirmed ? "springgreen" : "lightgray"
            }'>${stop.stopName}</span>`
          );
        return acc;
      }, [])
      .join(" > ");
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive.scss";
@import "../../styles/user_badge.scss";

.no-trains {
  text-align: center;

  padding: 1em;
  margin: 1em 0;

  font-size: 1.35em;

  background: var(--clr-bg);
}

.train {
  &-list {
    @include smallScreen() {
      width: 100%;
      overflow: hidden;
    }
  }

  &-row {
    padding: 1em;
    margin-bottom: 1em;

    background-color: var(--clr-secondary);

    cursor: pointer;
  }
}

.wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-template-rows: 1fr;

  @include smallScreen() {
    font-size: 1.3em;
  }
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &-top {
    display: flex;
    justify-content: space-between;
    align-items: center;

    div {
      display: flex;
    }
  }

  &-route {
    display: flex;
    align-items: center;

    margin: 5px 0;

    font-size: 1.1em;
  }

  &-stops {
    margin-bottom: 10px;

    font-size: 0.7em;

    @include smallScreen() {
      font-size: 0.75em;
    }
  }

  &-bottom {
    display: flex;
    align-items: center;

    button {
      margin-left: 10px;
      border-radius: 0.7em;
      padding: 0.2em 0.5em;

      border: 1px solid white;
    }
  }
}

.driver {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;

  grid-row: span 2;

  padding: 2em 0;

  &-info {
    margin-bottom: 1em;
  }

  &-name {
    margin: 0 0.3em;
    font-weight: bold;
  }

  &-type {
    color: #bbb;
    margin-left: 0.5em;
  }

  &-loco {
    width: 100%;
    text-align: center;
  }

  &-loco img {
    width: 200px;
    max-width: 200px;
  }
}

.stats {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  font-size: 0.9em;

  &-main {
    display: flex;
    margin-bottom: 1.5em;

    & > span {
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

    p {
      color: var(--clr-accent);
    }

    & > span {
      width: 100%;

      img {
        width: 2em;
      }
    }
  }
}

.warning {
  padding: 0.1em 0.8em;
  margin-right: 0.5em;

  display: flex;
  align-items: center;
  color: black;

  font-weight: bold;

  &.twr {
    background: var(--clr-twr);
  }

  &.skr {
    background: var(--clr-skr);
  }
}

@include smallScreen() {
  .info-bottom {
    text-align: center;
  }
}
</style>