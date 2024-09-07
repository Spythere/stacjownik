<template>
  <section class="driver-view">
    <div class="view-wrapper">
      <div v-if="chosenTrain">
        <div class="actions">
          <a class="a-button btn--image" @click="$router.back()">
            <img src="/images/icon-back.svg" alt="train icon" />
            <span>
              {{ $t('trains.driver-return-link') }}
            </span>
          </a>

          <router-link
            :to="`/journal/timetables?search-driver=${chosenTrain.driverName}`"
            class="a-button btn--image"
          >
            <span class="hidable">
              {{ $t('trains.driver-journal-link') }}
            </span>
            <img src="/images/icon-train.svg" alt="train icon" />
          </router-link>
        </div>

        <div class="train-card">
          <TrainInfo :train="chosenTrain" :extended="true" ref="trainInfo" />
          <TrainSchedule :train="chosenTrain" />
        </div>
      </div>

      <Loading v-else-if="apiStore.dataStatuses.connection == Status.Data.Loading" />

      <div v-else class="driver-not-found">
        <h2>&olcross; {{ $t('trains.driver-not-found-header') }}</h2>

        <p class="text--grayed">
          {{ $t('trains.driver-not-found-desc-1') }} <br />
          {{ $t('trains.driver-not-found-desc-2') }}
          <router-link to="/journal/timetables"
            >{{ $t('trains.driver-not-found-journal') }} </router-link
          >!
        </p>

        <p v-if="props.trainId && otherDriverTrains.length > 0">
          <i18n-t keypath="trains.driver-not-found-others">
            <template v-slot:driver>
              <b>{{ otherDriverTrains[0].driverName }}</b>
            </template>
          </i18n-t>
        </p>

        <div class="other-driver-trains">
          <template v-for="(train, i) in otherDriverTrains">
            <router-link :to="`/driver?trainId=${train.id}`">
              {{ train.trainNo }}
              | {{ regionsJSON.find((r) => r.id == train.region)?.name ?? 'PL1' }}
            </router-link>
          </template>
        </div>

        <div style="margin-top: 1em">
          <router-link to="/">&lt;&lt; {{ $t('trains.driver-not-found-return') }}</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TrainInfo from '../components/TrainsView/TrainInfo.vue';
import TrainSchedule from '../components/TrainsView/TrainSchedule.vue';
import Loading from '../components/Global/Loading.vue';
import { useMainStore } from '../store/mainStore';
import { useApiStore } from '../store/apiStore';
import { Status } from '../typings/common';
import { regions as regionsJSON } from '../data/options.json';

const props = defineProps({
  trainId: {
    type: String
  },

  modalId: {
    type: String
  }
});

const mainStore = useMainStore();
const apiStore = useApiStore();

const chosenTrain = computed(() =>
  mainStore.trainList.find((train) => train.id == props.trainId || train.modalId == props.modalId)
);

const otherDriverTrains = computed(() => {
  return mainStore.trainList.filter(
    (train) =>
      train.driverId == Number(props.trainId?.split('|')[0]) &&
      (train.timetableData || train.online || train.lastSeen >= Date.now() - 60000)
  );
});
</script>

<style lang="scss" scoped>
@import '../styles/responsive';

$viewBgCol: #1a1a1a;

.driver-view {
  margin: 0 auto;
  padding: 1em 0;
  max-width: var(--max-container-width);
  min-height: calc(100vh - 7em);
}

.actions {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5em;
}

.actions > a {
  background-color: $viewBgCol;
  padding: 0.5em;
  border-radius: 0.5em 0.5em 0 0;

  &:hover {
    background-color: lighten($viewBgCol, 10);
  }
}

.train-card {
  background-color: $viewBgCol;
  border-radius: 0 0 0.5em 0.5em;
}

.driver-not-found {
  background-color: $viewBgCol;
  text-align: center;
  padding: 1em;
  border-radius: 0.5em 0.5em;

  p {
    padding: 0.5em 0;
  }

  a {
    text-decoration: underline;
    color: white;
  }
}

.other-driver-trains {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5em;
}

@include smallScreen {
  .actions > a > span.hidable {
    display: none;
  }
}
</style>
