import Train from '@/scripts/interfaces/Train';
import TrainStop from '@/scripts/interfaces/TrainStop';
import { defineComponent } from 'vue';

export default defineComponent({
  data: () => ({
    STATS: {
      main: [
        {
          name: 'speed',
          unit: 'km/h',
        },
        {
          name: 'length',
          unit: 'm',
        },
        {
          name: 'mass',
          unit: 't',
          multiplier: 0.001,
        },
      ],

      position: [
        {
          name: 'scenery',
          prop: 'currentStationName',
        },
        {
          name: 'route',
          prop: 'connectedTrack',
        },
        {
          name: 'signal',
          prop: 'signal',
        },
        {
          name: 'distance',
          prop: 'distance',
          unit: 'm',
        },
      ],
    },
  }),

  methods: {
    lastSeenMessage(timestamp: number) {
      const diff = Date.now() - timestamp;
      const diffMins = Math.floor(diff / 60000);

      return diffMins < 1
        ? this.$t('trains.last-seen-now')
        : diffMins < 2
        ? this.$t('trains.last-seen-min')
        : this.$t('trains.last-seen-ago', { minutes: diffMins });
    },

    displayStopList(stops: TrainStop[]): string | undefined {
      if (!stops) return '';

      return stops
        .reduce((acc: string[], stop: TrainStop, i: number) => {
          if (stop.stopType.includes('ph') && !stop.stopNameRAW.includes('po.'))
            acc.push(`<strong style='color:${stop.confirmed ? 'springgreen' : 'white'}'>${stop.stopName}</strong>`);
          else if (
            i > 0 &&
            i < stops.length - 1 &&
            !/po\.|sbl/gi.test(stop.stopNameRAW)
          )
            acc.push(`<span style='color:${stop.confirmed ? 'springgreen' : 'lightgray'}'>${stop.stopName}</span>`);
          return acc;
        }, [])
        .join(' > ');
    },

    currentDistance(stops: TrainStop[]) {
      return stops.filter((stop) => stop.confirmed).slice(-1)[0]?.stopDistance || 0;
    },

    confirmedPercentage(stops: TrainStop[]) {
      return Number(((stops.filter((stop) => stop.confirmed).length / stops.length) * 100).toFixed(0));
    },

    currentDelay(stops: TrainStop[]) {
      const delay =
        stops.find((stop, i) => (i == 0 && !stop.confirmed) || (i > 0 && stops[i - 1].confirmed && !stop.confirmed))
          ?.departureDelay || 0;

      if (delay > 0) return `<span style='color: salmon'>${this.$t('trains.delayed')} ${delay} min</span>`;
      else if (delay < 0) return `<span style='color: lightgreen'>${this.$t('trains.preponed')} ${delay} min</span>`;
      else return this.$t('trains.on-time');
    },

    displayLocoInfo(locoType: string) {
      if (locoType.includes('EN')) return `${this.$t('trains.EZT')}`;
      if (locoType.includes('SN')) return `${this.$t('trains.SZT')}`;
      if (locoType.startsWith('E')) return `${this.$t('trains.loco-electric')}`;
      if (locoType.startsWith('S')) return `${this.$t('trains.loco-diesel')}`;

      return '';
    },

    getSceneriesWithComments(timetableData: Train['timetableData']) {
      const commentList =
        timetableData?.followingStops.reduce((acc, stop, i) => {
          if (stop.comments) acc.push(stop.stopNameRAW);

          return acc;
        }, [] as string[]) || [];

      const moreCount = commentList.length - 10;

      return commentList.slice(0, 10).join(', ') + (moreCount > 0 ? `... (+${moreCount})` : '');
    },

    displayDistance(distance: number) {
      if (distance < 1000) return `${distance}m`;

      return `${(distance / 1000).toPrecision(2)}km`;
    },

    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.src = require('@/assets/unknown.png');
    },
  },
});
