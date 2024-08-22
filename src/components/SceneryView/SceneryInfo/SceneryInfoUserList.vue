<template>
  <section class="info-user-list">
    <h3 class="user-header section-header">
      <img src="/images/icon-user.svg" alt="Users icon" />
      &nbsp;{{ $t('scenery.users') }} &nbsp;
      <span class="text--primary">{{ onlineScenery?.stationTrains?.length || 0 }}</span
      >&nbsp;/&nbsp;<span class="text--primary">{{ onlineScenery?.maxUsers || 0 }}</span>
    </h3>

    <transition-group name="users-anim" tag="ul">
      <li class="badge user badge-none" v-if="!onlineScenery?.stationTrains?.length" key="no-users">
        {{ $t('scenery.no-users') }}
      </li>

      <li
        v-for="{ train, status } in stationTrains"
        class="badge user"
        :key="train.id"
        :data-status="status"
      >
        <router-link :to="train.driverRouteLocation" class="a-block">
          <span class="user_train">{{ train.trainNo }}</span>
          <span class="user_name">{{ train.driverName }}</span>
        </router-link>
      </li>
    </transition-group>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import routerMixin from '../../../mixins/routerMixin';
import { ActiveScenery, Station } from '../../../typings/common';
import { getTrainStopStatus } from '../utils';
import { useMainStore } from '../../../store/mainStore';

export default defineComponent({
  mixins: [routerMixin],

  props: {
    onlineScenery: {
      type: Object as PropType<ActiveScenery>,
      required: false
    },
    station: {
      type: Object as PropType<Station>
    }
  },

  data() {
    return {
      mainStore: useMainStore()
    };
  },

  computed: {
    stationTrains() {
      if (!this.onlineScenery) return;

      const name = this.station?.generalInfo?.checkpoints[0] ?? this.onlineScenery.name;

      return this.onlineScenery.stationTrains.map((train) => {
        const stop = train.timetableData?.followingStops.find(
          (stop) =>
            stop.stopNameRAW.toLowerCase() == name.toLowerCase() ||
            this.station?.generalInfo?.checkpoints.includes(stop.stopNameRAW)
        );

        const status = stop
          ? getTrainStopStatus(stop, train.currentStationName, this.onlineScenery!.name)
          : 'no-timetable';

        return {
          train,
          status
        };
      });
    }
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
}

ul {
  position: relative;
}

.user {
  &[data-status='no-timetable'] .user_train {
    background-color: $no-timetable;
  }

  &[data-status='departed'] .user_train {
    background-color: $departed;
  }

  &[data-status='stopped'] .user_train {
    background-color: $stopped;
  }

  &[data-status='online'] .user_train {
    background-color: $online;
  }

  &[data-status='terminated'] .user_train {
    background-color: $terminated;
  }

  &[data-status='disconnected'] .user_train {
    background-color: $disconnected;
  }

  &[data-status='offline'] {
    background: firebrick;
    pointer-events: none;
  }
}

.user_train {
  color: black;
  background-color: $no-timetable;

  transition: background-color 200ms;
  -ms-transition: background-color 200ms;
  -webkit-transition: background-color 200ms;
}

.users-anim {
  &-move,
  &-enter-active,
  &-leave-active {
    transition: all 250ms ease;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translateX(5px);
  }

  &-leave-active {
    position: absolute;
  }
}
</style>
