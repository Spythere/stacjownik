<template>
  <section class="info-user-list">
    <h3 class="user-header section-header">
      {{ $t('scenery.users') }}
      <img :src="icons.user" alt="icon-user" />
    </h3>

    <div
      v-for="(train, i) in computedStationTrains"
      class="badge user"
      :class="train.stopStatus"
      :key="train.trainNo + i"
      tabindex="0"
      @click="() => navigateToTrain(train.trainNo)"
      @keydown.enter="navigateToTrain(train.trainNo)"
    >
      <span class="user_train">{{ train.trainNo }}</span>
      <span class="user_name">{{ train.driverName }}</span>
    </div>

    <div class="badge user badge-none" v-if="!computedStationTrains || computedStationTrains.length == 0">
      {{ $t('scenery.no-users') }}
    </div>
  </section>
</template>

<script lang="ts">
import Station from '@/scripts/interfaces/Station';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },
  },

  setup(props) {
    const computedStationTrains = computed(() => {
      if (!props.station) return [];
      if (!props.station.onlineInfo) return [];
      if (!props.station.onlineInfo.stationTrains) return [];

      return props.station.onlineInfo.stationTrains.map((train) => {
        const scheduledTrainStatus = props.station.onlineInfo?.scheduledTrains?.find(
          (st) => st.trainNo === train.trainNo
        );

        return {
          ...train,
          stopStatus: scheduledTrainStatus?.stopStatus || 'no-timetable',
        };
      });
    });

    return { computedStationTrains };
  },

  data: () => ({
    icons: {
      user: require('@/assets/icon-user.svg'),
    },
  }),

  methods: {
    navigateToTrain(trainNo: number) {
      this.$router.push({
        name: 'TrainsView',
        query: { train: trainNo.toString() },
      });
    },
  },
});
</script>

<style lang="scss" scoped>
$no-timetable: #aaa;
$departed: springgreen;
$stopped: #ffa600;
$online: gold;
$terminated: red;
$disconnected: slategray;

.info-user-list {
  ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
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
</style>
