<template>
  <section class="info-user-list">
    <h3 class="user-header section-header">
      <img :src="getIcon('user')" alt="icon-user" />
      &nbsp;{{ $t('scenery.users') }} &nbsp;
      <span class="text--primary">{{ station.onlineInfo?.currentUsers || '0' }}</span
      >&nbsp;/&nbsp;<span class="text--primary">{{ station.onlineInfo?.maxUsers || '0' }}</span>
    </h3>

    <div
      v-for="train in computedStationTrains"
      class="badge user"
      :class="train.stopStatus"
      :key="train.trainId"
      tabindex="0"
      @click.prevent="selectModalTrain(train.trainId, $event.currentTarget)"
      @keydown.enter="selectModalTrain(train.trainId, $event.currentTarget)"
    >
      <span class="user_train">{{ train.trainNo }}</span>
      <span class="user_name">{{ train.driverName }}</span>
    </div>

    <div
      class="badge user badge-none"
      v-if="!computedStationTrains || computedStationTrains.length == 0"
    >
      {{ $t('scenery.no-users') }}
    </div>
  </section>
</template>

<script lang="ts">
import { PropType, computed, defineComponent } from 'vue';
import imageMixin from '../../../mixins/imageMixin';
import modalTrainMixin from '../../../mixins/modalTrainMixin';
import routerMixin from '../../../mixins/routerMixin';
import Station from '../../../scripts/interfaces/Station';
import { useStore } from '../../../store/store';

export default defineComponent({
  mixins: [routerMixin, imageMixin, modalTrainMixin],

  props: {
    station: {
      type: Object as PropType<Station>,
      required: true
    }
  },

  setup(props) {
    const store = useStore();

    const computedStationTrains = computed(() => {
      if (!props.station) return [];

      const station = props.station as Station;
      if (!station.onlineInfo) return [];
      if (!station.onlineInfo.stationTrains) return [];

      return station.onlineInfo.stationTrains.map((train) => {
        const scheduledTrainStatus = station.onlineInfo?.scheduledTrains?.find(
          (st) => st.trainNo === train.trainNo
        );

        return {
          ...train,
          stopStatus: scheduledTrainStatus?.stopStatus || 'no-timetable'
        };
      });
    });

    return { computedStationTrains, store };
  }
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
