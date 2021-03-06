<template>
  <div class="train-table">
    <div class="no-trains" v-if="computedTrains.length == 0">
      Ups! Brak pociągów do wyświetlenia :/
    </div>

    <ul class="train-list">
      <li
        class="train-row"
        v-for="(train, i) in computedTrains"
        :key="i"
        :id="train.timetableData.timetableId"
      >
        <span class="wrapper">
          <span
            class="info"
            @click="changeScheduleShowState(train.timetableData.timetableId)"
          >
            <div class="info-main">
              <div class="info-category">
                <div class="category-left">
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

                <div class="category-right tooltip">
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
                    Szczegółowy rozkład jazdy pociągu {{ train.trainNo }}
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
                  Przez:

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
import { Vue, Component, Prop } from "vue-property-decorator";

import Train from "@/scripts/interfaces/Train";

import TrainSchedule from "@/components/TrainsView/TrainSchedule.vue";
import TrainStop from "@/scripts/interfaces/TrainStop";

@Component({
  components: { TrainSchedule },
})
export default class TrainTable extends Vue {
  @Prop() computedTrains!: Train[];

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

  changeScheduleShowState(timetableId: number) {
    this.showedSchedule = this.showedSchedule === timetableId ? 0 : timetableId;
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
  font-size: 1.35em;

  padding: 1rem;
  margin: 1rem 0;

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
    margin-bottom: 1rem;

    background-color: var(--clr-secondary);

    cursor: pointer;

    & > .wrapper {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(0, 1fr));

      @include smallScreen() {
        grid-template-columns: 1fr;
        grid-template-rows: repeat(3, minmax(100px, 1fr));

        gap: 0.4em 0;

        font-size: 1.1em;
      }

      @include bigScreen() {
        font-size: 1.1rem;
      }
    }
  }
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &-category {
    display: flex;
    justify-content: space-between;
    align-items: center;

    font-size: 1.1em;

    div {
      display: flex;
    }

    .category-right {
      padding: 0.15em 0.5em;

      background-color: var(--clr-accent);
      border-radius: 1em;

      -moz-user-select: none;
      -webkit-user-select: none;
      user-select: none;

      img {
        vertical-align: middle;
        width: 1.2em;
      }

      .tooltip-text {
        font-size: 0.9em;
        background-color: var(--clr-accent);

        &::after {
          border-color: var(--clr-accent) transparent transparent transparent;
        }
      }
    }
  }

  &-route {
    display: flex;
    align-items: center;

    margin: 5px 0;

    font-size: 1.2em;
  }

  &-stops {
    margin-bottom: 10px;

    font-size: 0.9em;
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
  flex-wrap: wrap;

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
    width: 13em;
    max-width: 200px;
  }
}

.stats {
  display: flex;
  flex-direction: column;
  justify-content: space-around;

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