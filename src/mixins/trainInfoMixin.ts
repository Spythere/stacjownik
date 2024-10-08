import { defineComponent } from 'vue';
import { Train, TrainStop } from '../typings/common';

export default defineComponent({
  data: () => ({
    STATS: {
      main: [
        {
          name: 'speed',
          unit: 'km/h'
        },
        {
          name: 'length',
          unit: 'm'
        },
        {
          name: 'mass',
          unit: 't',
          multiplier: 0.001
        }
      ],

      position: [
        {
          name: 'scenery',
          prop: 'currentStationName'
        },
        {
          name: 'route',
          prop: 'connectedTrack'
        },
        {
          name: 'signal',
          prop: 'signal'
        },
        {
          name: 'distance',
          prop: 'distance',
          unit: 'm'
        }
      ]
    }
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

    displayTrainPosition(train: Train) {
      let positionString = '';

      positionString += this.$t('trains.current-scenery') + ' ';

      if (train.currentStationHash) positionString += train.currentStationName + ' ';
      else
        positionString +=
          train['currentStationName'].replace(/.[a-zA-Z0-9]+.sc/, '') + ' (offline) ';

      if (train.signal)
        positionString += this.$t('trains.current-signal') + ' ' + train.signal + ' ';

      if (train.connectedTrack)
        positionString += this.$t('trains.current-track') + ' ' + train.connectedTrack + ' ';

      if (train.distance) positionString += `(${this.displayDistance(train.distance)})`;

      return positionString.charAt(0).toUpperCase() + positionString.slice(1);
    },

    getTrainStopsHtml(stops: TrainStop[]): string {
      if (!stops) return '';

      return stops
        .reduce((acc: string[], stop: TrainStop, i: number) => {
          if (stop.stopType.includes('ph'))
            acc.push(
              `<strong style='color:${stop.confirmed ? 'springgreen' : 'white'}'>${
                stop.stopName
              }</strong>`
            );
          else if (i > 0 && i < stops.length - 1 && !/(, po$|sbl)/gi.test(stop.stopNameRAW))
            acc.push(
              `<span style='color:${stop.confirmed ? 'springgreen' : 'lightgray'}'>${
                stop.stopName
              }</span>`
            );
          return acc;
        }, [])
        .join(' > ');
    },

    currentDistance(stops: TrainStop[]) {
      return stops.filter((stop) => stop.confirmed).slice(-1)[0]?.stopDistance || 0;
    },

    confirmedPercentage(stops: TrainStop[]) {
      return Number(
        ((stops.filter((stop) => stop.confirmed).length / stops.length) * 100).toFixed(0)
      );
    },

    currentDelay(stops: TrainStop[]) {
      const lastConfirmedStop = stops.find(
        (stop, i) =>
          (i == 0 && !stop.confirmed) ||
          (i > 0 && stops[i - 1].confirmed && !stop.confirmed) ||
          (stops[i + 1] == undefined && stop.confirmed)
      );

      const lastDelay = lastConfirmedStop?.departureDelay ?? lastConfirmedStop?.arrivalDelay ?? 0;

      if (lastDelay > 0)
        return `<span style='color: salmon'>${this.$t('trains.delayed')} ${lastDelay} min</span>`;
      else if (lastDelay < 0)
        return `<span style='color: lightgreen'>${this.$t('trains.preponed')} ${lastDelay} min</span>`;
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
        timetableData?.followingStops.reduce((acc, stop) => {
          if (stop.comments) acc.push(stop.stopNameRAW);

          return acc;
        }, [] as string[]) || [];

      const moreCount = commentList.length - 10;

      return commentList.slice(0, 10).join(', ') + (moreCount > 0 ? `... (+${moreCount})` : '');
    },

    displayDistance(distance: number) {
      if (distance < 1000) return `${distance}m`;

      return `${(distance / 1000).toPrecision(2)}km`;
    }
  }
});
