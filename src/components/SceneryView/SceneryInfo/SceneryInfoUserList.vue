<template>
  <section class="info-user-list">
    <h3 class="user-header section-header">
      <img :src="icons.user" alt="icon-user" />
      &nbsp;{{ $t('scenery.users') }} &nbsp;
      <span class="text--primary">{{ station.onlineInfo?.currentUsers || '0' }}</span
      >&nbsp;/&nbsp;<span class="text--primary">{{ station.onlineInfo?.maxUsers || '0' }}</span>
    </h3>

    <div
      v-for="(train, i) in computedStationTrains"
      class="badge user"
      :class="train.stopStatus"
      :key="train.trainId"
      tabindex="0"
      @click="selectTrain(train.trainId)"
      @keydown.enter="selectTrain(train.trainId)"
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
import routerMixin from '@/mixins/routerMixin';
import Station from '@/scripts/interfaces/Station';
import { useStore } from '@/store/store';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  mixins: [routerMixin],

  props: {
    station: {
      type: Object as () => Station,
      default: {},
    },
  },

  setup(props) {
    const store = useStore();

    const computedStationTrains = computed(() => {
      if (!props.station) return [];

      const station = props.station as Station;
      if (!station.onlineInfo) return [];
      if (!station.onlineInfo.stationTrains) return [];

      return station.onlineInfo.stationTrains.map((train) => {
        const scheduledTrainStatus = station.onlineInfo?.scheduledTrains?.find((st) => st.trainNo === train.trainNo);

        return {
          ...train,
          stopStatus: scheduledTrainStatus?.stopStatus || 'no-timetable',
        };
      });
    });

    return { computedStationTrains, store };
  },

  data: () => ({
    icons: {
      user: require('@/assets/icon-user.svg'),
    },
  }),

  methods: {
    selectTrain(trainId: string) {
      this.store.chosenModalTrain = this.store.trainList.find((train) => train.trainId == trainId);
    },
  },
});
</script>

<style lang="scss" scoped>
$no-timetable: #aaa;
$departed: springgreen;
$stopped: #ffa600;
$online: gold;
$terminated: salmon;
$disconnected: slategray;

.info-user-list {
  width: 100%;

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

