<template>
  <div class="scenery-history">
    <h2>HISTORIA DYŻURÓW</h2>

    <ul>
      <li v-for="(dispatcher, i) in dispatcherHistory" :key="i">
        {{ dispatcher.dispatcherName }}
        &nbsp;
        {{ timestampToString(dispatcher.dispatcherFrom) }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue';

interface DispatcherHistory {
  dispatcherName: string;
  dispatcherId: number;
  dispatcherFrom: any;
  dispatcherTo: any;
}

interface SceneryHistory {
  stops: any[];
  checkpoints: any[];
  stationName: string;
  currentDispatcher: string;
  currentDispatcherId: number;
  currentDispatcherFrom: number;
  dispatcherHistory: DispatcherHistory[];
}

interface HistoryResultAPI {
  result: SceneryHistory;
  errorMessage?: any;
}

const PROD_MODE = true;

const API_URL = PROD_MODE
  ? 'https://stacjownik-api-di22o.ondigitalocean.app/api/getSceneryHistory'
  : 'http://localhost:3001/api/getTimetables';

export default defineComponent({
  data: () => ({
    dispatcherHistory: [] as DispatcherHistory[],
  }),
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup() {
    return {};
  },

  async mounted() {
    try {
      const apiResult: HistoryResultAPI = (await axios.get(`${API_URL}?name=${this.name}`)).data;

      if (!apiResult.errorMessage) this.dispatcherHistory = apiResult.result.dispatcherHistory;
    } catch (error) {
      console.error(error); 
    }
  },

  methods: {
    timestampToString: (timestamp: number): string =>
      new Date(timestamp).toLocaleTimeString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
});
</script>

<style scoped></style>
