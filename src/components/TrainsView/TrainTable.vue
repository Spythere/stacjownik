<template>
  <transition name="status-anim" mode="out-in" tag="div" class="train-table">
    <div :key="apiStore.dataStatuses.connection">
      <div class="table-warning" key="offline" v-if="store.isOffline">
        {{ $t('app.offline') }}
      </div>

      <Loading v-else-if="apiStore.dataStatuses.connection == Status.Loading" key="loading" />

      <div class="table-warning" key="no-trains" v-else-if="trains.length == 0">
        {{ $t('trains.no-trains') }} (region: <b>{{ store.region.name }}</b
        >)
      </div>

      <transition-group name="list-anim" tag="ul">
        <li
          class="train-row"
          v-for="train in trains"
          :key="train.id"
        >
          <router-link class="a-block" :to="train.driverRouteLocation">
            <TrainInfo :train="train" :extended="false" />
          </router-link>
        </li>
      </transition-group>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, Ref } from 'vue';
import { useMainStore } from '../../store/mainStore';
import Loading from '../Global/Loading.vue';
import TrainInfo from './TrainInfo.vue';
import { Status, Train } from '../../typings/common';
import { useApiStore } from '../../store/apiStore';

export default defineComponent({
  components: { Loading, TrainInfo },

  props: {
    trains: {
      type: Array as PropType<Train[]>,
      required: true
    }
  },

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
@import '../../styles/responsive.scss';
@import '../../styles/animations.scss';

.train-table {
  height: calc(100vh - 11em);
  min-height: 500px;

  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
}

.table-warning {
  text-align: center;

  padding: 1em 0;
  font-size: 1.25em;

  background: #1a1a1a;
}

li.train-row {
  background-color: var(--clr-secondary);
  margin-bottom: 1em;
  width: 100%;
}
</style>
