<template>
  <transition
    name="status-anim"
    mode="out-in"
    tag="div"
    class="train-table"
    @scroll="onScroll"
    ref="trainTableRef"
  >
    <div :key="apiStore.dataStatuses.connection">
      <div class="table-warning" key="offline" v-if="store.isOffline">
        {{ $t('app.offline') }}
      </div>

      <Loading v-else-if="apiStore.dataStatuses.connection == Status.Loading" key="loading" />

      <div class="table-warning" key="no-trains" v-else-if="trains.length == 0">
        {{ $t('trains.no-trains') }} (region: <b>{{ store.region.name }}</b
        >)
      </div>

      <transition-group name="list-anim" tag="div" class="list_wrapper">
        <TrainTableItem v-for="train in trains" :key="train.id" :train="train" />
      </transition-group>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, Ref } from 'vue';
import { useMainStore } from '../../store/mainStore';
import { useApiStore } from '../../store/apiStore';
import { Status, Train } from '../../typings/common';

import Loading from '../Global/Loading.vue';
import TrainTableItem from './TrainTableItem.vue';
import TrainInfo from './TrainInfo.vue';

export default defineComponent({
  components: { Loading, TrainInfo, TrainTableItem },

  props: {
    trains: {
      type: Array as PropType<Train[]>,
      required: true
    }
  },

  data: () => ({
    scrollTop: 0
  }),

  setup() {
    const store = useMainStore();
    const apiStore = useApiStore();
    const searchedTrain = inject('searchedTrain') as Ref<string>;
    const searchedDriver = inject('searchedDriver') as Ref<string>;

    return {
      searchedTrain,
      searchedDriver,
      store,
      apiStore,
      Status: Status.Data,
      sorterActive: inject('sorterActive') as {
        id: string | number;
        dir: number;
      }
    };
  },

  activated() {
    (this.$refs['trainTableRef'] as HTMLElement).scrollTop = this.scrollTop;
  },

  methods: {
    onScroll(e: Event) {
      this.scrollTop = (e.target as HTMLElement).scrollTop;
    }
  },

  computed: {
    dataStatus() {
      if (this.store.isOffline) return Status.Data.Offline;

      if (this.trains.length == 0 && this.apiStore.dataStatuses.connection == Status.Data.Loading)
        return Status.Data.Loading;

      return Status.Data.Loaded;
    }
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';
@use '../../styles/animations';

.train-table {
  height: calc(100vh - 11em);
  min-height: 500px;

  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.list_wrapper {
  padding: 2px; // ensures focused items outline visibility
}

.table-warning {
  text-align: center;

  padding: 1em 0;
  font-size: 1.25em;

  background: #1a1a1a;
}
</style>
