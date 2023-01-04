<template>
  <div class="train-table">
    <transition name="anim" mode="out-in">
      <div :key="store.dataStatuses.trains">
        <div class="table-info" v-if="store.isOffline">
          {{ $t('app.offline') }}
        </div>

        <Loading v-else-if="trains.length == 0 && store.dataStatuses.trains == 0" />

        <div class="table-info no-trains" v-else-if="trains.length == 0 && store.dataStatuses.trains != 0">
          {{ $t('trains.no-trains') }}
        </div>

        <!-- <div class="timeouts-warning" v-if="trainNumbersWithTimeouts.length == 0">
          <b class="warning-timeout">?</b>
          {{ $t('trains.timeout') }}
        </div> -->
        <transition-group name="list-anim" tag="ul" class="train-list" v-else>
          <li
            class="train-row"
            v-for="train in currentTrains"
            :key="train.trainId"
            @click.stop="selectModalTrain(train.trainId)"
            @keydown.enter="selectModalTrain(train.trainId)"
          >
            <TrainInfo :train="train" />
          </li>
        </transition-group>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, Ref } from 'vue';
import modalTrainMixin from '../../mixins/modalTrainMixin';
import returnBtnMixin from '../../mixins/returnBtnMixin';
import Train from '../../scripts/interfaces/Train';
import { useStore } from '../../store/store';
import Loading from '../Global/Loading.vue';
import TrainInfo from './TrainInfo.vue';

export default defineComponent({
  components: { Loading, TrainInfo },

  props: {
    trains: {
      type: Array as PropType<Train[]>,
      required: true,
    },
  },

  mixins: [returnBtnMixin, modalTrainMixin],

  setup(props) {
    const store = useStore();
    const searchedTrain = inject('searchedTrain') as Ref<string>;
    const searchedDriver = inject('searchedDriver') as Ref<string>;
    const currentTrains = computed(() => {
      return props.trains;
    });

    return {
      searchedTrain,
      searchedDriver,
      currentTrains,
      store,
      sorterActive: inject('sorterActive') as {
        id: string | number;
        dir: number;
      },
      distanceLimitExceeded: computed(
        () => props.trains.findIndex(({ timetableData }) => timetableData && timetableData.routeDistance > 200) != -1
      ),
    };
  },

  computed: {
    trainNumbersWithTimeouts() {
      return this.store.trainList.filter((train) => train.isTimeout).map((train) => train.trainNo);
    },
  },

  activated() {
    const query = this.$route.query;
    if (query.trainNo && query.driverName) {
      this.searchedDriver = query.driverName.toString();
      this.searchedTrain = query.trainNo.toString();
      setTimeout(() => {
        this.selectModalTrain(query.driverName! + query.trainNo!.toString());
      }, 20);
    }
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/animations.scss';

.anim {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active {
    transition: all 100ms ease-out;
  }

  &-leave-active {
    transition: all 100ms ease-out;
  }
}

.table-info {
  text-align: center;

  padding: 1em 0;

  font-size: 1.5em;

  background: #1a1a1a;
}

img.train-image {
  width: 12em;
}

.traffic-warning {
  padding: 1em 0;
  margin-bottom: 0.5em;
  background: var(--clr-warning);
}

.timeouts-warning {
  background-color: #333;

  font-weight: bold;
  font-size: 1.05em;

  margin-bottom: 0.5em;
  padding: 0.5em;
}

.warning-timeout {
  background-color: #be3728;
  color: white;

  display: inline-block;
  text-align: center;

  width: 1.25em;
  height: 1.25em;
  border-radius: 50%;
}

.train {
  &-list {
    position: relative;
    
    @include smallScreen() {
      width: 100%;
    }
  }

  &-row {
    background-color: var(--clr-secondary);
    margin-bottom: 1em;

    cursor: pointer;
  }

  &_cars {
    display: flex;
    align-items: center;

    overflow: auto;
  }
}

.paginator {
  display: flex;
  justify-content: center;

  &_item {
    padding: 0.25em 0.5em;
    margin: 0 0.5em;
    outline: 2px solid salmon;

    min-width: 30px;

    text-align: center;

    cursor: pointer;

    &.page-number {
      font-weight: bold;
      color: gold;
    }

    &.disabled {
      outline: 2px solid lightgray;
      color: lightgray;
    }

    &:focus {
      outline: 2px solid white;
    }
  }
}

@include smallScreen() {
  .info-bottom {
    text-align: center;
  }
}
</style>
