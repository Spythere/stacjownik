<template>
  <div class="player-chart">
    <canvas ref="barChart" id="player-chart-canvas"></canvas>
    <!-- <Bar v-if="showChart" :options="chartOptions" :data="chuj" :style="chartStyles" /> -->
  </div>
</template>

<script setup lang="ts">
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  BarController
} from 'chart.js';

import { onActivated, onMounted, PropType, ref, useTemplateRef } from 'vue';
import zoomPlugin from 'chartjs-plugin-zoom';
import { API } from '@/typings/api';
import { Status } from '@/typings/common';

Chart.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
  zoomPlugin
);

Chart.defaults.backgroundColor = '#ccc';
Chart.defaults.borderColor = '#333';
Chart.defaults.color = '#fff';

const showChart = ref(false);

const chartRef = useTemplateRef('barChart');
let chart: Chart | null = null;

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

onMounted(() => {
  // const chart = (barChart.value as any).chart;

  setupChart();
  renderChart();
});

function setupChart() {
  if (!chartRef.value) return;

  chart = new Chart(chartRef.value, {
    type: 'bar',

    data: {
      labels: new Array(30).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 29 + i);

        return date.toLocaleDateString('pl-PL', {
          month: '2-digit',
          day: '2-digit'
        });
      }),

      datasets: [
        {
          label: 'Rozkłady jazdy',
          data: [],
          borderWidth: 1,
          backgroundColor: '#57baeb'
        },
        {
          label: 'Dyżury',
          data: [],
          borderWidth: 1,
          backgroundColor: '#eb5757'
        }
      ]
    },

    options: {
      animation: false,
      maintainAspectRatio: false,

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
    }
  });

  chart.zoomScale('x', {
    min: 10,
    max: 50
  });
}

function renderChart() {
  showChart.value = false;

  if (props.playerJournal === undefined) {
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

  if (chart) {
    chart.data.datasets[0].data = countList.map((v) => v.timetableCount);
    chart.data.datasets[1].data = countList.map((v) => v.dutyCount);

    console.log(chart.data);
    chart.update();
  }

  showChart.value = true;
}

// const chart = (barChart.value as any).chart;
</script>

<style lang="scss" scoped>
.player-chart {
  background-color: var(--clr-tile);
  padding: 0.5em;
  border-radius: 0.5em;
  margin-top: 1em;
  position: relative;
  height: 350px;
}
</style>
