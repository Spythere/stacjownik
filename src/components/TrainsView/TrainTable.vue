<template>
  <div class="train-table">
    <transition name="anim" mode="out-in">
      <div :key="store.dataStatuses.trains">
        <Loading v-if="trains.length == 0 && store.dataStatuses.trains == 0" />

        <div class="table-info no-trains" v-if="trains.length == 0 && store.dataStatuses.trains != 0">
          {{ $t('trains.no-trains') }}
        </div>

        <ul class="train-list">
          <li
            class="train-row"
            v-for="train in currentTrains"
            :key="train.trainId"
            @click.stop="selectModalTrain(train.trainId)"
            @keydown.enter="selectModalTrain(train.trainId)"
          >
            <TrainInfo :train="train" />
          </li>
        </ul>
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
  methods: {
    enter(el: HTMLElement) {
      const maxHeight = getComputedStyle(el).height;
      el.style.height = '0px';
      getComputedStyle(el);
      setTimeout(() => {
        el.style.height = maxHeight;
      }, 10);
    },
    afterEnter(el: HTMLElement) {
      el.style.height = 'auto';
    },
    leave(el: HTMLElement) {
      el.style.height = getComputedStyle(el).height;
      setTimeout(() => {
        el.style.height = '0px';
      }, 10);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

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
  margin: 1em 0;

  font-size: 1.5em;

  background: #333;
}

img.train-image {
  width: 12em;
}

.traffic-warning {
  padding: 1em 0;
  margin-bottom: 0.5em;
  background: var(--clr-warning);
}

.train {
  &-list {
    overflow: auto;

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
