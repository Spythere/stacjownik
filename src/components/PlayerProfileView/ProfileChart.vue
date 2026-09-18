<template>
  <div class="player-chart">
    <Bar
      v-if="showChart"
      ref="barChart"
      id="player-chart"
      :options="chartOptions"
      :data="chartData"
      :style="chartStyles"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

import { computed, onActivated, PropType, ref, useTemplateRef, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';
import { API } from '@/typings/api';
import { Status } from '@/typings/common';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, zoomPlugin);
ChartJS.defaults.backgroundColor = '#9BD0F5';
ChartJS.defaults.borderColor = '#aaa';
ChartJS.defaults.color = '#fff';

const showChart = ref(false);

const props = defineProps({
  playerName: {
    type: String
  },

  playerJournal: {
    type: Object as PropType<API.PlayerJournal.Data>
  },

  journalStatus: {
    type: Number as PropType<Status.Data>,
    required: true
  }
});

watch(
  computed(() => props.playerJournal),
  () => {
    renderChart();
  }
);

const chartOptions: ChartOptions<'bar'> = {
  maintainAspectRatio: false,
  responsive: true,
  animation: false,

  plugins: {
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
        threshold: 0.5
      },

      zoom: {
        wheel: {
          enabled: true
        },
        pinch: {
          enabled: true
        },
        mode: 'x'
      }
    }
  },

  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0
      }
    }
  }
};

const chartStyles = {
  height: '300px'
};

let chartData: ChartData<'bar'> = {
  datasets: []
};

function renderChart() {
  if (props.playerJournal === undefined) {
    showChart.value = false;
    return;
  }

  const countList = new Array(30).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 29 + i);

    return {
      date,
      timetableCount: 0,
      dutyCount: 0
    };
  });

  if (props.playerJournal) {
    props.playerJournal.timetables.forEach((t) => {
      const dateString = new Date(t.createdAt).toLocaleDateString('pl-PL');
      const countEl = countList.find((c) => c.date.toLocaleDateString('pl-PL') == dateString);

      if (countEl) countEl.timetableCount += 1;
    });

    props.playerJournal.duties.forEach((t) => {
      const dateString = new Date(t.createdAt).toLocaleDateString('pl-PL');
      const countEl = countList.find((c) => c.date.toLocaleDateString('pl-PL') == dateString);

      if (countEl) countEl.dutyCount += 1;
    });
  }

  chartData = {
    labels: countList.map((c) => {
      return c.date.toLocaleDateString('pl-PL', {
        month: '2-digit',
        day: '2-digit'
      });
    }),

    datasets: [
      {
        label: 'Rozkłady jazdy',
        data: countList.map((v) => v.timetableCount),
        borderWidth: 1,
        backgroundColor: '#57baeb'
      },
      {
        label: 'Dyżury',
        data: countList.map((v) => v.dutyCount),
        borderWidth: 1,
        backgroundColor: '#eb5757'
      }
    ]
  };

  showChart.value = true;
}

// const chart = (barChart.value as any).chart;

// chart.zoomScale('x', {
//   min: 20,
//   max: 50
// });

// onMounted(() => {
//   const chart = (barChart.value as any).chart;

//   chart.zoomScale('x', {
//     min: 20,
//     max: 50
//   });
// });
</script>

<style lang="scss" scoped>
.player-chart {
  margin-top: 1em;
  position: relative;
}

a {
  color: #57baeb;
}
</style>
