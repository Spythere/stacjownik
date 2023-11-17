<template>
  <transition name="status-anim" mode="out-in" tag="div" class="train-table">
    <div :key="store.dataStatuses.trains">
      <div class="table-info" key="offline" v-if="store.isOffline">
        {{ $t('app.offline') }}
      </div>

      <Loading v-else-if="trains.length == 0 && store.dataStatuses.trains == 0" key="loading" />

      <div
        class="table-info"
        key="no-trains"
        v-else-if="trains.length == 0 && store.dataStatuses.trains != 0"
      >
        {{ $t('trains.no-trains') }}
      </div>

      <transition-group name="list-anim" tag="ul">
        <li
          class="train-row"
          v-for="train in trains"
          :key="train.trainId"
          tabindex="0"
          @click.stop="selectModalTrain(train.trainId, $event.currentTarget)"
          @keydown.enter="selectModalTrain(train.trainId, $event.currentTarget)"
        >
          <TrainInfo :train="train" />
        </li>
      </transition-group>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, Ref } from 'vue';
import modalTrainMixin from '../../mixins/modalTrainMixin';
import Train from '../../scripts/interfaces/Train';
import { useStore } from '../../store/mainStore';
import Loading from '../Global/Loading.vue';
import TrainInfo from './TrainInfo.vue';
import { Status } from '../../typings/common';

export default defineComponent({
  components: { Loading, TrainInfo },

  props: {
    trains: {
      type: Array as PropType<Train[]>,
      required: true
    }
  },

  mixins: [modalTrainMixin],

  setup() {
    const store = useStore();
    const searchedTrain = inject('searchedTrain') as Ref<string>;
    const searchedDriver = inject('searchedDriver') as Ref<string>;

    return {
      searchedTrain,
      searchedDriver,
      store,
      sorterActive: inject('sorterActive') as {
        id: string | number;
        dir: number;
      }
    };
  },

  computed: {
    dataStatus() {
      if (this.store.isOffline) return Status.Data.Offline;

      if (this.trains.length == 0 && this.store.dataStatuses.trains == Status.Data.Loading)
        return Status.Data.Loading;

      return Status.Data.Loaded;
    }
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
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/animations.scss';

.train-table {
  position: relative;

  height: 90vh;
  min-height: 550px;
  overflow-y: auto;
  overflow-x: hidden;
}

.table-info {
  text-align: center;

  padding: 1em 0;

  font-size: 1.5em;

  background: #1a1a1a;
}

li.train-row {
  background-color: var(--clr-secondary);
  margin-bottom: 1em;
  width: 100%;

  cursor: pointer;
}
</style>
