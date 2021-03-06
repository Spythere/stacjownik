<template>
  <div class="scenery-info">
    <div class="info-header">
      <div class="scenery-name">
        <a
          v-if="stationInfo.stationURL"
          :href="stationInfo.stationURL"
          target="_blank"
          rel="noopener noreferrer"
          >{{ stationInfo.stationName }}</a
        >

        <span v-else>{{ stationInfo.stationName }}</span>
      </div>
      <div class="scenery-hash" v-if="stationInfo.stationHash">
        #{{ stationInfo.stationHash }}
      </div>
    </div>

    <section v-if="!timetableOnly">
      <div
        class="info-stats"
        :class="!stationInfo.stationHash ? 'no-stats' : ''"
      >
        <span class="likes">
          <img :src="likeIcon" alt="icon-like" />
          <span>{{ stationInfo.dispatcherRate }}</span>
        </span>

        <span class="users">
          <img :src="userIcon" alt="icon-user" />
          <span>{{ stationInfo.currentUsers }}</span>
          /
          <span>{{ stationInfo.maxUsers }}</span>
        </span>

        <span class="spawns">
          <img :src="spawnIcon" alt="icon-spawn" />
          <span>{{ stationInfo.spawns.length }}</span>
        </span>

        <span class="schedules">
          <img :src="timetableIcon" alt="icon-timetable" />
          <span v-if="stationInfo.scheduledTrains">
            <span style="color: #eee">{{
              stationInfo.scheduledTrains.length
            }}</span>
            /
            <span style="color: #bbb">{{
              stationInfo.scheduledTrains.filter(
                (train) => train.stopInfo.confirmed
              ).length
            }}</span>
          </span>
        </span>
      </div>

      <div class="info-brief">
        <img
          v-if="stationInfo.controlType"
          :src="require(`@/assets/icon-${stationInfo.controlType}.svg`)"
          :alt="stationInfo.controlType"
          :title="
            $t('desc.control-type') + $t(`controls.${stationInfo.controlType}`)
          "
        />

        <img
          v-if="stationInfo.signalType"
          :src="require(`@/assets/icon-${stationInfo.signalType}.svg`)"
          :alt="stationInfo.signalType"
          :title="
            $t('desc.signals-type') + $t(`signals.${stationInfo.signalType}`)
          "
        />

        <img
          v-if="stationInfo.SBL && stationInfo.SBL !== ''"
          :src="SBLIcon"
          alt="SBL"
          :title="$t('desc.SBL') + `${stationInfo.SBL}`"
        />

        <img
          v-if="stationInfo.default"
          :src="td2Icon"
          alt="default-pack"
          :title="$t('desc.default')"
        />

        <img
          v-if="stationInfo.nonPublic || !stationInfo.reqLevel"
          :src="lockIcon"
          alt="non-public"
          :title="$t('desc.non-public')"
        />

        <img
          v-if="stationInfo.unavailable"
          :src="unavailableIcon"
          alt="icon-unavailable"
          :title="$t('desc.unavailable')"
        />

        <img
          v-if="stationInfo.stationLines && stationInfo.stationLines != ''"
          :src="realIcon"
          alt="real"
          :title="$t('desc.real')"
        />
      </div>

      <div class="info-dispatcher">
        <div class="dispatcher" v-if="stationInfo.stationHash">
          <span
            class="dispatcher_level"
            :style="
              calculateExpStyle(
                stationInfo.dispatcherExp,
                stationInfo.dispatcherIsSupporter
              )
            "
          >
            {{
              stationInfo.dispatcherExp > 1 ? stationInfo.dispatcherExp : "L"
            }}
          </span>

          <span class="dispatcher_name">{{ stationInfo.dispatcherName }}</span>
        </div>

        <span class="status-badge" :class="stationInfo.statusID">
          {{ $t(`status.${stationInfo.statusID}`) }}
          {{
            stationInfo.statusID == "online" ? stationInfo.statusTimeString : ""
          }}
        </span>
      </div>

      <div class="info-lists">
        <div class="user-list">
          <h3 class="user-header">
            {{ $t("scenery.users") }}
            <img :src="userIcon" alt="icon-user" />
          </h3>

          <div
            v-for="(train, i) in computedStationTrains"
            class="user"
            :class="train.stopStatus"
            :key="train.trainNo + i"
            @click="() => navigateToTrain(train.trainNo)"
          >
            <span class="user_train">{{ train.trainNo }}</span>
            <span class="user_name">{{ train.driverName }}</span>
          </div>

          <div
            class="user offline"
            v-if="!computedStationTrains || computedStationTrains.length == 0"
          >
            {{ $t("scenery.no-users") }}
          </div>
        </div>

        <div class="spawn-list">
          <h3 class="spawn-header">
            {{ $t("scenery.spawns") }}
            <img :src="spawnIcon" alt="icon-spawn" />
          </h3>

          <span
            class="spawn"
            v-for="(spawn, i) in stationInfo.spawns"
            :key="spawn.spawnName + stationInfo.dispatcherName + i"
          >
            <span class="spawn_name">{{ spawn.spawnName }}</span>
            <span class="spawn_length">{{ spawn.spawnLength }}m</span>
          </span>

          <span
            class="spawn none"
            v-if="!stationInfo.spawns || stationInfo.spawns.length == 0"
            >{{ $t("scenery.no-spawns") }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Station from "@/scripts/interfaces/Station";
import styleMixin from "@/mixins/styleMixin";
import { computed, defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: {
    stationInfo: {
      type: Object as () => Station,
      default: {},
    },

    timetableOnly: Boolean,
  },

  mixins: [styleMixin],

  data: () => ({
    likeIcon: require("@/assets/icon-like.svg"),
    spawnIcon: require("@/assets/icon-spawn.svg"),
    timetableIcon: require("@/assets/icon-timetable.svg"),
    userIcon: require("@/assets/icon-user.svg"),

    SBLIcon: require("@/assets/icon-SBL.svg"),
    td2Icon: require("@/assets/icon-td2.svg"),
    lockIcon: require("@/assets/icon-lock.svg"),
    unavailableIcon: require("@/assets/icon-unavailable.svg"),
    realIcon: require("@/assets/icon-real.svg"),
  }),

  setup(props) {
    const computedStationTrains = computed(() => {
      if (!props.stationInfo) return [];

      return props.stationInfo.stationTrains.map((train) => {
        const scheduledTrainStatus = props.stationInfo?.scheduledTrains.find(
          (st) => st.trainNo === train.trainNo
        );

        return {
          ...train,
          stopStatus: scheduledTrainStatus?.stopStatus || "no-timetable",
        };
      });
    });

    return { computedStationTrains };
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
@import "../../styles/responsive.scss";
@import "../../styles/user_badge.scss";
@import "../../styles/variables.scss";

h3 {
  margin: 0.5em 0;
  padding: 0.3em;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: 1.5em;

  img {
    width: 1.1em;
    margin-left: 0.5em;
  }
}

.info {
  &-header {
    padding: 1em;

    & > .scenery-name {
      font-weight: bold;
      color: $accentCol;

      font-size: 3.5em;

      text-transform: uppercase;
    }

    & > .scenery-hash {
      line-height: 0.8em;
      color: #aaa;

      font-size: 1.5em;
    }
  }

  &-stats {
    padding: 1rem 0;

    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    font-size: 1.65em;

    &.no-stats {
      opacity: 0.5;
    }

    & > span {
      display: flex;
      align-items: center;

      margin: 0.3em;
    }

    .likes,
    .spawns {
      color: $accentCol;
    }

    span > img {
      width: 1.2em;
      margin-right: 0.5em;
    }
  }

  &-brief {
    padding: 1em 0;

    img {
      width: 3.5em;
      margin: 0 0.5em;

      border: 2px solid #4e4e4e;
      border-radius: 0.5em;
    }
  }

  &-dispatcher {
    display: flex;
    align-items: center;
    justify-content: center;

    .dispatcher {
      font-size: 2em;

      &_level {
        display: inline-block;
        margin-right: 0.3em;
        background: firebrick;

        border-radius: 0.1em;

        width: 1.5em;
        height: 1.5em;
        line-height: 1.5em;
        font-weight: bold;
      }

      &_name {
        margin-right: 1em;
      }
    }

    .status-badge {
      font-size: 1.2em;
    }
  }

  &-lists {
    display: flex;

    align-items: center;
    flex-direction: column;

    & > .user-list {
      ul {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }
}

.user,
.spawn {
  font-weight: 600;

  display: inline-block;
  padding: 0;

  background: #585858;

  margin: 0.25em;

  span {
    display: inline-block;
    padding: 0.2em 0.4em;
  }
}

.user {
  cursor: pointer;

  &_train {
    color: black;
    background-color: $no-timetable;

    transition: background-color 200ms;
    -ms-transition: background-color 200ms;
    -webkit-transition: background-color 200ms;
  }

  &.no-timetable .user_train {
    background-color: $no-timetable;
  }

  &.departed > &_train {
    background-color: $departed;
  }

  &.stopped > &_train {
    background-color: $stopped;
  }

  &.online > &_train {
    background-color: $online;
  }

  &.terminated > &_train {
    background-color: $terminated;
  }

  &.disconnected > &_train {
    background-color: $disconnected;
  }

  &.offline {
    background: firebrick;
    pointer-events: none;
  }
}

.spawn {
  &_length {
    background: $accentCol;
    color: black;
  }
}

.spawn.none,
.user.offline {
  font-weight: 600;

  padding: 0.2em 0.4em;
  background: firebrick;

  text-align: center;

  @include smallScreen() {
    font-size: 1em;
  }
}
</style>