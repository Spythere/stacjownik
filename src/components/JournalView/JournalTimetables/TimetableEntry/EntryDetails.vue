<template>
  <div>
    <div class="details-actions">
      <button class="btn--action" @click="toggleExtraInfo">
        <b>{{ $t('journal.entry-details') }}</b>
        <img :src="`/images/icon-arrow-${showExtraInfo ? 'asc' : 'desc'}.svg`" alt="Arrow icon" />
      </button>

      <router-link
        v-if="driverRouteLocation !== null"
        class="a-button btn--action btn-timetable"
        :to="driverRouteLocation"
      >
        <img src="/images/icon-train.svg" alt="train icon" />
        <b>{{ $t('journal.timetable-online-button') }}</b>
      </router-link>
    </div>

    <div class="details-body" v-if="showExtraInfo">
      <div class="g-separator"></div>

      <div v-if="timetableDetails">
        <DetailsStops :timetable="timetableDetails" />
        <DetailsSceneries :timetable="timetableDetails" />
        <DetailsSpecs :timetable="timetableDetails" />
        <DetailsStockDangers v-if="timetableDetails.warningNotes" :timetable="timetableDetails" />
        <DetailsStock :timetable="timetableDetails" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { useApiStore } from '@/store/apiStore';
import { API } from '@/typings/api';
import StockList from '@/components/Global/StockList.vue';
import DetailsStops from '../TimetableDetails/DetailsStops.vue';
import DetailsSceneries from '../TimetableDetails/DetailsSceneries.vue';
import DetailsSpecs from '../TimetableDetails/DetailsSpecs.vue';
import DetailsStockDangers from '../TimetableDetails/DetailsStockDangers.vue';
import DetailsStock from '../TimetableDetails/DetailsStock.vue';

const i18n = useI18n();
const apiStore = useApiStore();

const props = defineProps({
  showExtraInfo: {
    type: Boolean,
    required: true
  },

  timetableEntry: {
    type: Object as PropType<API.TimetableHistory.DataShort>,
    required: true
  }
});

const emits = defineEmits(['toggleExtraInfo']);

const timetableDetails = ref<API.TimetableHistory.Data | null>(null);

const driverRouteLocation = computed<RouteLocationRaw | null>(() => {
  if (props.timetableEntry.terminated) return null;

  return {
    name: 'DriverView',
    query: {
      trainId: `${props.timetableEntry.driverId}|${props.timetableEntry.trainNo}|eu`
    }
  };
});

async function fetchTimetableDetails() {
  try {
    const responseData = await apiStore.client.get<API.TimetableHistory.Response>(
      'api/getTimetables',
      {
        timetableId: props.timetableEntry.id,
        returnType: 'detailed'
      }
    );

    if (!responseData || responseData.length != 1) {
      timetableDetails.value = null;
      return;
    }

    timetableDetails.value = responseData[0];
  } catch (error) {
    // this.dataStatus = Status.Data.Error;
    console.error(error);
  }
}

async function toggleExtraInfo() {
  if (props.showExtraInfo == false) {
    await fetchTimetableDetails();
  }

  emits('toggleExtraInfo', timetableDetails.value);
}
</script>

<style lang="scss" scoped>
@use '@/styles/responsive';
@use '@/styles/badge';

.details-body {
  margin-top: 0.5em;
}

.details-actions {
  display: flex;
  gap: 0.5em;
  margin-top: 1em;

  button img {
    height: 1.25em;
  }
}

hr {
  margin: 0.5em 0;
}

@include responsive.smallScreen {
  .details-actions {
    justify-content: center;
  }
}
</style>
