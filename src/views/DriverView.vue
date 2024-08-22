<template>
  <section class="driver-view">
    <div class="view-wrapper">
      <div v-if="chosenTrain">
        <div class="actions">
          <router-link to="/" class="a-button btn--image">
            <img src="/images/icon-back.svg" alt="train icon" />
            <span>{{ $t('trains.driver-return-link') }}</span>
          </router-link>
          <router-link
            :to="`/journal/timetables?search-driver=${chosenTrain.driverName}`"
            class="a-button btn--image"
          >
            <img src="/images/icon-train.svg" alt="train icon" />
            <span class="hidable">
              {{ $t('trains.driver-journal-link') }}
            </span>
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
        <p>
          {{ $t('trains.driver-not-found-desc-1') }} <br />
          {{ $t('trains.driver-not-found-desc-2') }}
          <router-link to="/journal/timetables"
            >{{ $t('trains.driver-not-found-journal') }} </router-link
          >!
        </p>

        <router-link to="/">&lt;&lt; {{ $t('trains.driver-not-found-return') }}</router-link>
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

const props = defineProps({
  trainId: {
    type: String,
    required: true
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
</script>

<style lang="scss" scoped>
@import '../styles/responsive';

$viewBgCol: #1a1a1a;

.driver-view {
  margin: 0 auto;
  padding: 1em 0;
  max-width: 2000px;
  min-height: 95vh;
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
}

.driver-not-found {
  background-color: $viewBgCol;
  text-align: center;
  padding: 1em;

  p {
    padding: 1em 0;
    color: #aaa;
  }

  a {
    text-decoration: underline;
  }
}

@include smallScreen {
  .actions > a > span.hidable {
    display: none;
  }
}
</style>
