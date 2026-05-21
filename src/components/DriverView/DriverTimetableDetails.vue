<template>
  <div class="timetable-history-box">
    <!-- Loaded Data -->
    <div v-if="detailsState == Status.Data.Loaded"></div>

    <!-- Loading -->
    <Loading v-else-if="detailsState == Status.Data.Loading" />

    <!-- No Data -->
    <div v-else-if="detailsState == Status.Data.Warning"></div>

    <!-- Error -->
    <div v-else></div>
  </div>
</template>

<script lang="ts" setup>
import { useApiStore } from '@/store/apiStore';
import { Status, Train } from '@/typings/common';
import { onActivated, PropType, ref } from 'vue';
import Loading from '../Global/Loading.vue';
import { API } from '@/typings/api';

const apiStore = useApiStore();

const detailsState = ref(Status.Data.Loading);
const detailsData = ref<API.TimetableDetails.Response | null>(null);

const props = defineProps({
  chosenTrain: {
    type: Object as PropType<Train>,
    required: true
  }
});

onActivated(() => {
  fetchTimetableDetails();
});

async function fetchTimetableDetails() {
  if (!props.chosenTrain.timetableData) {
    detailsState.value = Status.Data.Warning;
    return;
  }

  detailsState.value = Status.Data.Loading;

  try {
    const response = await apiStore.client.get<API.TimetableDetails.Response>(
      'api/getTimetableDetails',
      {
        timetableId: props.chosenTrain.timetableData.timetableId
      }
    );

    if (!response) {
      detailsState.value = Status.Data.Warning;
      return;
    }

    detailsState.value = Status.Data.Loaded;
    detailsData.value = response;
  } catch (error) {
    console.error(error);
    detailsState.value = Status.Data.Error;
  }
}
</script>

<style lang="scss" scoped>
.timetable-history-box {
  padding: 0.5em;
  margin-bottom: 1em;
  background-color: #111;
}
</style>
