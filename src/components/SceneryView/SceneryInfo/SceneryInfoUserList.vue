<template>
  <section class="info-user-list">
    <h3 class="user-header section-header">
      <img src="/images/icon-user.svg" alt="Users icon" />
      &nbsp;{{ $t('scenery.users') }} &nbsp;
      <span class="text--primary">{{ onlineScenery?.currentUsers || 0 }}</span
      >&nbsp;/&nbsp;<span class="text--primary">{{ onlineScenery?.maxUsers || 0 }}</span>
    </h3>

    <div
      v-for="train in onlineScenery?.stationTrains"
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
      v-if="!onlineScenery?.scheduledTrains || onlineScenery.scheduledTrains.length == 0"
    >
      {{ $t('scenery.no-users') }}
    </div>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import modalTrainMixin from '../../../mixins/modalTrainMixin';
import routerMixin from '../../../mixins/routerMixin';
import { OnlineScenery } from '../../../scripts/interfaces/store/storeTypes';

export default defineComponent({
  mixins: [routerMixin, modalTrainMixin],

  props: {
    onlineScenery: {
      type: Object as PropType<OnlineScenery>,
      required: false
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
