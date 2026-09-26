<template>
  <Card :isOpen="true" @toggleCard="toggleChartCard">
    <div class="card-container">
      <select name="section-select" id="section-select" v-model="selectedSectionName">
        <option :value="section" v-for="section in sectionNames">
          {{ section }}
        </option>
      </select>

      <div class="chart-container">
        <canvas ref="chartEl" id="traffic-chart-canvas" height="250"></canvas>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, useTemplateRef } from 'vue';
import Card from './Card.vue';
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  LineController,
  PointElement
} from 'chart.js';

import zoomPlugin from 'chartjs-plugin-zoom';
import { API } from '@/typings/api.ts';
import { useMainStore } from '@/store/mainStore.ts';
import { ActiveScenery, Station } from '@/typings/common.ts';

// Setup
Chart.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LineController,
  PointElement,
  CategoryScale,
  LinearScale,
  zoomPlugin
);

// Props
const props = defineProps({
  stationInfo: {
    type: Object as PropType<Station>
  },

  stationName: {
    type: String,
    required: true
  },

  onlineScenery: {
    type: Object as PropType<ActiveScenery>
  }
});

// Emits
const emits = defineEmits(['toggleCard']);

// Template refs
const chartRef = useTemplateRef('chartEl');

// Store
// const apiStore = useApiStore();
const mainStore = useMainStore();

// Variables
let chart: Chart | null = null;

// Refs
// const trafficData = ref<API.TimetableHistory.Response | null>(null);
const sectionNames = ref<string[]>([]);
const selectedSectionName = ref('');

// Hooks
onMounted(() => {
  setupChart();
  prepareSections();
  // fetchTrafficData();
});

// Computed
const chartTrains = computed(() => {
  return props.onlineScenery?.scheduledTrains;
});

// Functions
// async function fetchTrafficData() {
//   try {
//     const response = await apiStore.client.get<API.TimetableHistory.Response>('api/getTimetables', {
//       includesScenery: props.sceneryName,
//       countLimit: 100
//     });

//     trafficData.value = response;
//   } catch (error) {
//     console.error('Error occurred when fetching traffic data', error);
//     trafficData.value = null;
//   }
// }

function prepareSections() {
  sectionNames.value.length = 0;

  const availableRoutes =
    props.stationInfo?.generalInfo?.routes.all.filter((r) => !r.hidden && !r.isInternal) || [];

  availableRoutes.forEach((route) => {
    const routeChoices = availableRoutes.filter(
      (routeChoice) => routeChoice.routeName != route.routeName
    );

    routeChoices.forEach((routeChoice) => {
      if (!sectionNames.value.includes(`${routeChoice.routeName}-${route.routeName}`)) {
        sectionNames.value.push(`${route.routeName}-${routeChoice.routeName}`);
      }
    });
  });

  selectedSectionName.value = sectionNames.value[0] || '';
}

function setupChart() {
  if (!chartRef.value) return;

  chart = new Chart(chartRef.value, {
    type: 'line',

    data: {
      labels: new Array(30).fill(0).map((_, i) => i),

      datasets: [
        {
          label: 'test',
          data: [1, 2, 3, 4, 5, 1, 2, 4, 5, 3],
          backgroundColor: '#ccc',
          borderColor: '#fff'
        }
      ]
    },

    options: {
      animation: false,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: 'bottom',

          labels: {
            usePointStyle: true,
            padding: 20
          }
        },

        tooltip: {
          callbacks: {
            title: function (items) {
              if (!items.length) return '';

              return items[0].dataset.label;
            },

            label: function (context) {
              const point: any = context.raw;

              return [`Stacja: ${point.station}`, `Czas: ${point.time}`];
            }
          }
        },

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
      interaction: {
        // intersect: false,
      },
      scales: {
        y: {}
      }
    }
  });

  // (chart.canvas.parentNode as any).style.height = '400px';
  // (chart.canvas.parentNode as any).style.width = '600px';
}

function toggleChartCard(isOpen: boolean) {
  emits('toggleCard', isOpen);
}
</script>

<style lang="scss" scoped>
.card-container {
  padding: 0.5em;
}
.chart-container {
  height: 500px;
  width: 90vw;
  max-width: 2000px;
}
</style>
