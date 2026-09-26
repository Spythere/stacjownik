<template>
  <div class="chart-container">
    <canvas ref="chartEl" id="player-chart-canvas" height="250"></canvas>
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

import { computed, onMounted, PropType, ref, useTemplateRef, watch } from 'vue';
import zoomPlugin from 'chartjs-plugin-zoom';
import { API } from '@/typings/api';
import { PlayerHistoryEntryType, Status } from '@/typings/common';
import { useI18n } from 'vue-i18n';

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
  },

  activeFilterType: {
    type: String as PropType<PlayerHistoryEntryType>,
    required: true
  }
});

const emits = defineEmits(['onBarClick']);
const { t } = useI18n();

const showChart = ref(false);
const chartRef = useTemplateRef('chartEl');

let chart: Chart | null = null;

onMounted(() => {
  setupChart();
  renderChart();
});

watch(
  computed(() => props.playerJournal),
  () => {
    renderChart();
  }
);

watch(
  computed(() => props.activeFilterType),
  (v) => {
    if (!chart) return;

    chart.data.datasets[0].hidden = v != 'All' && v != 'Timetable';
    chart.data.datasets[1].hidden = v != 'All' && v != 'Dispatcher';
    chart.data.datasets[2].hidden = v != 'All' && v != 'IssuedTimetable';

    chart.zoomScale('x', {
      min: 0,
      max: 50
    });

    renderChart();
  }
);

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
          label: t('profile.chart.timetables-label'),
          data: [],
          borderWidth: 1,
          backgroundColor: '#57baeb'
        },
        {
          label: t('profile.chart.duties-label'),
          data: [],
          borderWidth: 1,
          backgroundColor: '#eb5757'
        },
        {
          label: t('profile.chart.issued-timetables-label'),
          data: [],
          borderWidth: 1,
          backgroundColor: '#8cef57'
        }
      ]
    },

    options: {
      animation: false,
      maintainAspectRatio: false,

      onClick(_, elements, chart) {
        if (elements.length == 0 || !chart.data.labels) return;

        const dateIndex = elements[0].index;
        emits('onBarClick', chart.data.labels[dateIndex]);
      },

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

  if (window.innerWidth < 1150) {
    chart.zoomScale('x', {
      min: 15,
      max: 50
    });
  }

  (chart.canvas.parentNode as any).style.height = '250px';
  (chart.canvas.parentNode as any).style.width = '100%';
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
      dutyCount: 0,
      createdCount: 0
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

    props.playerJournal.issuedTimetables.forEach((t) => {
      const dateString = new Date(t.createdAt).toLocaleDateString('pl-PL');
      const countEl = countList.find((c) => c.date.toLocaleDateString('pl-PL') == dateString);

      if (countEl) countEl.createdCount += 1;
    });
  }

  if (chart) {
    chart.data.datasets[0].data = countList.map((v) => v.timetableCount);
    chart.data.datasets[1].data = countList.map((v) => v.dutyCount);
    chart.data.datasets[2].data = countList.map((v) => v.createdCount);

    chart.update();
  }

  showChart.value = true;
}
</script>

<style lang="scss" scoped>
.chart-container {
  background-color: var(--clr-tile);
  border-radius: 0.5em;
  padding: 0 0.5em;

  position: relative;
  overflow: auto;
}
</style>
