<template>
  <div class="player-chart">
    <Bar
      :options="chartOptions"
      :data="chartData"
      id="player-chart"
      :style="chartStyles"
      ref="bar"
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

import { onMounted, reactive, ref, useTemplateRef } from 'vue';
import { Bar } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, zoomPlugin);

ChartJS.defaults.backgroundColor = '#9BD0F5';
ChartJS.defaults.borderColor = '#aaa';
ChartJS.defaults.color = '#fff';

const bar = useTemplateRef('bar');

onMounted(() => {
  const chart = (bar.value as any).chart;

  chart.zoomScale('x', {
    min: 20,
    max: 50
  });
});

const chartOptions: ChartOptions<'bar'> = reactive({
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
});

const chartStyles = {
  height: '300px'
};

const chartData: ChartData<'bar'> = reactive({
  labels: new Array(30).fill('').map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 29 + i);

    return date.toLocaleDateString('pl-PL', {
      month: '2-digit',
      day: '2-digit'
    });
  }),

  datasets: [
    {
      label: 'Dyżury',
      data: new Array(30).fill(0).map((v) => Math.floor(Math.random() * 5)),
      borderWidth: 1,
      backgroundColor: '#eb5757'
    },
    {
      label: 'Rozkłady jazdy',
      data: new Array(30).fill(0).map((v) => Math.floor(Math.random() * 5)),
      borderWidth: 1,
      backgroundColor: '#57baeb'
    }
  ]
});
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
