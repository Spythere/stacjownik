<template>
  <Card :isOpen="true" @toggleCard="toggleChartCard">
    <div class="card-container">
      <select name="section-select" id="section-select" v-model="selectedSectionName">
        <option :value="section" v-for="section in sectionNames">
          {{ section }}
        </option>
      </select>

      <select name="checkpoint-select" id="checkpoint-select" v-model="selectedCheckpointName">
        <option :value="checkpoint" v-for="checkpoint in checkpointNames">
          {{ checkpoint }}
        </option>
      </select>

      <!-- 
      <div>
        <div v-for="train in chartTrains">
          <b>{{ train.trainName }}</b>
          <div v-for="point in train.points">
            {{ point.pointName }} {{ point.time }} {{ point.distance.toFixed(2) }}
          </div>
          <br />
        </div>
      </div> -->

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
import { ActiveScenery, Station } from '@/typings/common.ts';
import { timestampToTimeString } from '@/composables/time.ts';

// Types
export interface SceneryTrafficPoint {
  pointName: string;
  pointType: string;
  pointDistance: number;
  dateScheduled: string;
}

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
// const mainStore = useMainStore();

// Variables
let chart: Chart | null = null;

// Refs
const sectionNames = ref<string[]>([]);
const selectedSectionName = ref('');

const checkpointNames = ref<string[]>([]);
const selectedCheckpointName = ref('');

const pointDistances: Record<string, number> = {};

// Hooks
onMounted(async () => {
  prepareSections();
  prepareCheckpoints();

  // await fetchTrafficData();
  setupChart();
});

// Functions
// async function fetchTrafficData() {
//   try {
//     const response = await apiStore.client.get<API.SceneryTraffic.Response>(
//       'api/getSceneryTraffic',
//       {
//         scope: '12h',
//         name: props.stationName
//       }
//     );

//     trafficData.value = response;
//   } catch (error) {
//     console.error('Error occurred when fetching traffic data', error);
//     trafficData.value = null;
//   }
// }

function prepareChartData() {
  if (!props.onlineScenery) return [];

  const colors = ['#1976d2', '#d32f2f', '#388e3c', '#7b1fa2', '#f57c00', '#455a64'];

  const [arrivalSection, departureSection] = selectedSectionName.value.split('-');
  // const connections: StationConnection[] = [];
  const pointNames: Set<string> = new Set();
  // const pointDistances: Record<string, number> = {};

  let trafficData = props.onlineScenery.scheduledTrains
    .filter((s) => {
      if (s.checkpointStop.stopNameRAW.toLowerCase() != selectedCheckpointName.value.toLowerCase())
        return false;

      return (
        s.timetablePathElement.arrivalRouteExt == arrivalSection ||
        s.timetablePathElement.arrivalRouteExt == departureSection ||
        s.timetablePathElement.departureRouteExt == arrivalSection ||
        s.timetablePathElement.departureRouteExt == departureSection
      );
    })
    .map((s) => {
      const points: SceneryTrafficPoint[] = [];

      const checkpointDistance =
        s.train.timetableData!.followingStops.find(
          (stop) => stop.stopNameRAW.toLowerCase() == selectedCheckpointName.value.toLowerCase()
        )?.stopDistance || 0;

      const followingStops = s.train.timetableData!.followingStops;

      for (let i = 0; i < followingStops.length; i++) {
        const stop = followingStops[i];

        if (stop.stationName != props.stationName) continue;

        if (
          stop.arrivalLine &&
          stop.arrivalLine == s.timetablePathElement.arrivalRouteExt &&
          stop.arrivalTimestamp
        ) {
          let estimatedTimestamp = stop.arrivalTimestamp;
          let estimatedDistance = stop.stopDistance;

          if (i > 0) {
            const previousStop = followingStops[i - 1];

            const distanceDelta = stop.stopDistance - previousStop.stopDistance;
            const timeDelta = (stop.arrivalTimestamp || 0) - (previousStop.departureTimestamp || 0);

            const routeDistance =
              (props.stationInfo?.generalInfo?.routes.all?.find(
                (r) => r.routeName == stop.arrivalLine
              )?.routeLength || 0) / 1000;

            if (distanceDelta > 0 && timeDelta > 0 && routeDistance > 0) {
              const estimatedTimestampDelta = Math.round(
                (routeDistance * timeDelta) / distanceDelta
              );

              estimatedTimestamp -= estimatedTimestampDelta;
              estimatedDistance -= distanceDelta;
            }
          }

          points.push({
            pointName: stop.arrivalLine || '',
            pointType: 'arrivalLine',
            pointDistance: estimatedDistance,
            dateScheduled: new Date(estimatedTimestamp).toISOString()
          });

          pointNames.add(stop.arrivalLine);
        }

        if (stop.arrivalTimestamp) {
          points.push({
            pointName: stop.stopNameRAW,
            dateScheduled: new Date(stop.arrivalTimestamp).toISOString(),
            pointType: 'pointArrival',
            pointDistance: stop.stopDistance
          });

          pointNames.add(stop.stopNameRAW);
        }

        if (stop.departureTimestamp && stop.arrivalTimestamp != stop.departureTimestamp) {
          points.push({
            pointName: stop.stopNameRAW,
            dateScheduled: new Date(stop.departureTimestamp).toISOString(),
            pointType: 'pointDeparture',
            pointDistance: stop.stopDistance
          });

          pointNames.add(stop.stopNameRAW);
        }

        if (
          stop.departureLine &&
          stop.departureLine == s.timetablePathElement.departureRouteExt &&
          stop.departureTimestamp
        ) {
          let estimatedTimestamp = stop.departureTimestamp;
          let estimatedDistance = stop.stopDistance;

          if (i < followingStops.length - 1) {
            const nextStop = followingStops[i + 1];

            const distanceDelta = nextStop.stopDistance - stop.stopDistance;
            const timeDelta = (nextStop.arrivalTimestamp || 0) - (stop.departureTimestamp || 0);

            const routeDistance =
              (props.stationInfo?.generalInfo?.routes.all?.find(
                (r) => r.routeName == stop.departureLine
              )?.routeLength || 0) / 1000;

            if (distanceDelta > 0 && timeDelta > 0 && routeDistance > 0) {
              const estimatedTimestampDelta = Math.round(
                (routeDistance * timeDelta) / distanceDelta
              );

              estimatedTimestamp += estimatedTimestampDelta;
              estimatedDistance += distanceDelta;
            }
          }

          points.push({
            pointName: stop.departureLine,
            pointType: 'departureLine',
            pointDistance: estimatedDistance,
            dateScheduled: new Date(estimatedTimestamp).toISOString()
          });

          pointNames.add(stop.departureLine);

          break;
        }
      }

      return {
        trainLabel: `${s.train.timetableData!.category} ${s.train.trainNo}`,
        train: s.train,
        points
      };
    });

  console.log('pointNames', pointNames);
  console.log('trafficData', trafficData);

  return trafficData.map((data) => {
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      label: data.trainLabel,

      data: data.points.map((point) => ({
        x: new Date(point.dateScheduled).getTime(),
        y: Math.round(point.pointDistance * 10),
        pointName: point.pointName,
        time: point.dateScheduled,
        train: data.train
      })),

      borderColor: color,
      backgroundColor: color,
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 8,
      tension: 0,
      fill: false
    };
  });
}

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

function prepareCheckpoints() {
  const checkpoints = props.stationInfo?.generalInfo?.checkpoints || [];

  checkpointNames.value = checkpoints.length != 0 ? checkpoints : [props.stationName];
  selectedCheckpointName.value = checkpointNames.value[0];
}

function setupChart() {
  if (!chartRef.value) return;

  const data = prepareChartData();

  const railwayPlugin = {
    id: 'railwayPlugin',

    beforeDraw(chart: Chart) {
      const { ctx, chartArea, scales } = chart;

      const yScale = scales.y;

      // ctx.save();

      // // Linie stacji
      // stations.forEach((station, index) => {
      //   const y = yScale.getPixelForValue(index);

      //   ctx.beginPath();

      //   ctx.moveTo(chartArea.left, y);

      //   ctx.lineTo(chartArea.right, y);

      //   ctx.lineWidth = 1;

      //   ctx.strokeStyle = '#d7d7d7';

      //   ctx.stroke();
      // });

      // ctx.restore();
    }
  };

  chart = new Chart(chartRef.value, {
    type: 'line',

    data: {
      datasets: data
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

              return [
                `Stacja: ${point.pointName}`,
                `Czas: ${timestampToTimeString(point.time)}`,
                `Dystans: ${point.y}`
              ];
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
        intersect: false
      },
      scales: {
        x: {
          type: 'linear',

          ticks: {
            callback: function (value) {
              return timestampToTimeString(Number(value));
            }
          },

          title: {
            display: true,

            text: 'Czas'
          }
        },

        y: {
          reverse: false,

          ticks: {
            callback: function (value) {
              return null;
              // return (
              //   stops.value.find((s) => Math.round(s.stopDistance * 10) == value)?.stopName || null
              // );
            },

            font: {
              size: 14,
              weight: 'bold'
            }
          },

          grid: {
            display: false
          },

          title: {
            display: true,
            text: 'Stacja'
          }
        }
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
