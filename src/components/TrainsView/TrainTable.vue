<template>
  <div class="train-table">
    <div
      class="traffic-warning"
      v-if="distanceLimitExceeded"
    >
      {{ $t("trains.distance-exceeded") }}
    </div>

    <div
      class="no-trains"
      v-if="computedTrains.length == 0 && timetableLoaded"
    >
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
        :ref="train.timetableData && (el => { elList[train.timetableData.timetableId] = el })"
      >
        <div
          class="wrapper no-timetable"
          v-if="!train.timetableData"
        >
          <span class="info">
            <div class="info-category">
              <span>
                {{ train.trainNo }} |
                <span style="color: gold">
                  {{ $t("trains.no-timetable") }}
                </span>
              </span>
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
                :src="train.locoURL"
                @error="onImageError"
              />
            </span>
          </span>

          <span class="stats">
            <div class="stats-main">
              <span class="mass">
                <img
                  :src="massIcon"
                  alt="icon-mass"
                />
                {{ train.mass / 1000 }}t
              </span>

              <span class="speed">
                <img
                  :src="speedIcon"
                  alt="icon-speed"
                />
                {{ train.speed }} km/h
              </span>

              <span class="length">
                <img
                  :src="lengthIcon"
                  alt="icon-length"
                />
                {{ train.length }}m
              </span>
            </div>

            <div class="stats-position">
              <span class="station">
                <div class="stat-icon">
                  <img
                    :src="sceneryIcon"
                    alt="icon-scenery"
                  />
                </div>
                {{ train.currentStationName || "---" }}
              </span>
              <span class="track">
                <div class="stat-icon">
                  <img
                    :src="routeIcon"
                    alt="icon-scenery"
                  />
                </div>
                {{ train.connectedTrack || "---" }}
              </span>
              <span class="signal">
                <div class="stat-icon">
                  <img
                    :src="signalIcon"
                    alt="icon-scenery"
                  />
                </div>
                {{ train.signal || "---" }}
              </span>
              <span class="distance">
                <div class="stat-icon">
                  <img
                    :src="distanceIcon"
                    alt="icon-scenery"
                  />
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
              <span class="info-general">
                <span
                  class="warning twr"
                  v-if="train.timetableData.TWR"
                >
                  TWR
                </span>
                <span
                  class="warning skr"
                  v-if="train.timetableData.SKR"
                >
                  SKR
                </span>
                <span>
                  <strong>{{ train.timetableData.category }}</strong>
                  {{ train.trainNo }} |
                  <span style="color: gold">
                    {{ train.timetableData.routeDistance }} km
                  </span>
                </span>
              </span>

              <span class="info-srjp g-tooltip">
                <span class="activator">
                  SRJP

                  <img
                    :src="
                      showedSchedule == train.timetableData.timetableId
                        ? ascSVG
                        : descSVG
                    "
                    alt="arrow-icon"
                  />
                </span>

                <span class="content">
                  {{ $t("trains.detailed-timetable") }} {{ train.trainNo }}
                </span>
              </span>
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

                <span v-html="generateStopList(train.timetableData.followingStops)"></span>
              </span>
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
              &bull;
              <span class="driver-type">
                {{ train.locoType }}
              </span>

              <!-- <div>{{ train.cars.length }} wagonów</div> -->
            </div>

            <span class="driver-loco">
              <img
                class="train-image"
                :src="train.locoURL"
                @error="onImageError"
              />
            </span>

            <div
              class="driver-cars"
              v-html="calculateCars(train.locoType, train.cars) "
            >

            </div>
          </span>

          <span class="stats">
            <div class="stats-main">
              <span class="mass">
                <img
                  :src="massIcon"
                  alt="icon-mass"
                />
                {{ train.mass / 1000 }}t
              </span>

              <span class="speed">
                <img
                  :src="speedIcon"
                  alt="icon-speed"
                />
                {{ train.speed }} km/h
              </span>

              <span class="length">
                <img
                  :src="lengthIcon"
                  alt="icon-length"
                />
                {{ train.length }}m
              </span>
            </div>

            <div class="stats-position">
              <span class="station">
                <div class="stat-icon">
                  <img
                    :src="sceneryIcon"
                    alt="icon-scenery"
                  />
                </div>
                {{ train.currentStationName || "---" }}
              </span>
              <span class="track">
                <div class="stat-icon">
                  <img
                    :src="routeIcon"
                    alt="icon-scenery"
                  />
                </div>
                {{ train.connectedTrack || "---" }}
              </span>
              <span class="signal">
                <div class="stat-icon">
                  <img
                    :src="signalIcon"
                    alt="icon-scenery"
                  />
                </div>
                {{ train.signal || "---" }}
              </span>
              <span class="distance">
                <div class="stat-icon">
                  <img
                    :src="distanceIcon"
                    alt="icon-scenery"
                  />
                </div>
                {{ train.distance || "0" }}m
              </span>
            </div>
          </span>
        </div>

        <div
          class="train_extended-info"
          v-if="train.timetableData"
          v-show="showedSchedule == train.timetableData.timetableId"
        >
          <TrainSchedule
            :followingStops="train.timetableData.followingStops"
            :currentStationName="train.currentStationName"
            @click="changeScheduleShowState(train.timetableData.timetableId)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Train from "@/scripts/interfaces/Train";
import TrainStop from "@/scripts/interfaces/TrainStop";

import TrainSchedule from "@/components/TrainsView/TrainSchedule.vue";
import { DataStatus } from "@/scripts/enums/DataStatus";
import {
  computed,
  ComputedRef,
  defineComponent,
  onBeforeUpdate,
  Ref,
  ref,
} from "@vue/runtime-core";
import { useStore } from "@/store";
import { GETTERS } from "@/constants/storeConstants";

export default defineComponent({
  components: {
    TrainSchedule,
  },

  props: {
    computedTrains: {
      type: Array as () => Train[],
      required: true,
    },

    queryTrain: {
      type: String,
      required: false,
    },
  },

  data: () => ({
    showedSchedule: 0,
    defaultLocoImage: require("@/assets/unknown.png"),

    ascSVG: require("@/assets/icon-arrow-asc.svg"),
    descSVG: require("@/assets/icon-arrow-desc.svg"),

    speedIcon: require("@/assets/icon-speed.svg"),
    massIcon: require("@/assets/icon-mass.svg"),
    lengthIcon: require("@/assets/icon-length.svg"),

    distanceIcon: require("@/assets/icon-distance.svg"),
    sceneryIcon: require("@/assets/icon-scenery.svg"),
    signalIcon: require("@/assets/icon-signal.svg"),
    routeIcon: require("@/assets/icon-route.svg"),
  }),

  setup(props) {
    const store = useStore();
    const elList: Ref<HTMLElement[]> = ref([]);

    onBeforeUpdate(() => {
      elList.value.length = 0;
    });

    const timetableDataStatus: ComputedRef<DataStatus> = computed(
      () => store.getters[GETTERS.timetableDataStatus]
    );

    const timetableLoaded = computed(
      () => timetableDataStatus.value === DataStatus.Loaded
    );
    const timetableError = computed(
      () => timetableDataStatus.value === DataStatus.Error
    );

    const distanceLimitExceeded = computed(
      () =>
        props.computedTrains.findIndex(
          ({ timetableData }) =>
            timetableData && timetableData.routeDistance > 200
        ) != -1
    );

    return {
      timetableLoaded,
      timetableError,
      distanceLimitExceeded,
      elList,
    };
  },

  methods: {
    changeScheduleShowState(timetableId: number) {
      if (timetableId < 0) return;

      this.showedSchedule =
        this.showedSchedule == timetableId ? 0 : timetableId;

      this.$nextTick(() => {
        const currentEl: HTMLElement = this.elList[timetableId];

        currentEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    },

    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;

      imageEl.src = this.defaultLocoImage;
    },

    generateStopList(stops: TrainStop[]): string | undefined {
      if (!stops) return "";

      return stops
        .reduce((acc: string[], stop: TrainStop, i: number) => {
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
    },

    calculateCars(locoType: string, cars: string[]) {
      if (cars.length == 0 && locoType.includes("EN")) return "EZT";
      else if (cars.length == 0) return "LOK";

      return `${this.$t("trains.cars")}: <span style='color:gold'> ${
        cars.length
      }</span>`;
    },
  },

  watch: {
    queryTrain(trainNo: string) {
      const timetableId = this.computedTrains.find(
        (train) => train.trainNo == parseInt(trainNo)
      )?.timetableData?.timetableId;

      if (!timetableId) return;

      this.changeScheduleShowState(timetableId);
    },
  },
});
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

img.train-image {
  width: 12em;
}

.traffic-warning {
  padding: 1em 0.5em;
  margin-bottom: 0.5em;
  background: firebrick;
}

.train {
  &-list {
    @include smallScreen() {
      width: 100%;
    }
  }

  &-row {
    padding: 1em;
    margin-bottom: 1em;

    background-color: var(--clr-secondary);
    cursor: pointer;
  }

  &_cars {
    display: flex;
    align-items: center;

    overflow: auto;
  }
}

.wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20em, 1fr));
  grid-template-rows: 1fr;

  @include smallScreen() {
    font-size: 1.3em;
  }
}

.info {
  &-main {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .info-srjp .activator {
      display: flex;
      align-items: center;

      background-color: var(--clr-accent);
      border-radius: 0.5em;
      padding: 0.1em 0.35em;
    }
  }

  &-general {
    display: flex;
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
    text-align: center;
    word-wrap: break-word;
  }

  &-name {
    font-weight: bold;
  }

  &-loco {
    width: 100%;
    text-align: center;
  }

  &-cars {
    margin-top: 0.5em;
  }
}

.stats {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  font-size: 0.9em;

  padding: 1em 0;

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