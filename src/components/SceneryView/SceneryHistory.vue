<template>
  <div class="scenery-history">
    <h2>{{ $t('journal.title') }}</h2>

    <transition name="history-list-anim" mode="out-in">
      <ul :key="dispatcherTimeline.length">
        <li v-if="!isLoaded">
          <h3>{{ $t('journal.loading') }}</h3>
        </li>

        <li v-if="isLoaded && dispatcherTimeline.length == 0">
          <h3>{{ $t('journal.no-history') }}</h3>
        </li>

        <li v-for="(timeline, i) in dispatcherTimeline" :key="i">
          <h3
            @click="toggleTimeline(i)"
            @keydown.enter="toggleTimeline(i)"
            @keydown.space="toggleTimeline(i)"
            tabindex="0"
          >
            {{ timeline.date }} <img :src="timeline.showTimeline ? icons.ascArrow : icons.descArrow" alt="arrow" />
          </h3>

          <transition name="unfold-anim" @enter="enter" @afterEnter="afterEnter" @leave="leave">
            <div class="dispatcher-list" v-if="timeline.showTimeline">
              <div class="dispatcher-item" v-for="dispatcher in timeline.dispatchers" :key="dispatcher.dispatcherFrom">
                <span>
                  <span class="dispatcher-from text--primary">
                    {{ timestampToString(dispatcher.dispatcherFrom, true) }}
                  </span>
                  >
                  <span class="dispatcher-to text--primary">
                    {{ timestampToString(dispatcher.dispatcherTo, true) }}</span
                  >
                </span>
                <b>{{ dispatcher.dispatcherName }}</b>
              </div>
            </div>
          </transition>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent } from 'vue';

interface DispatcherTimeline {
  date: string;
  dispatchers: DispatcherHistory[];
  showTimeline: boolean;
}

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

const API_URL = 'https://stacjownik-api-di22o.ondigitalocean.app/api/getSceneryHistory';

export default defineComponent({
  data: () => ({
    dispatcherHistory: [] as DispatcherHistory[],
    dispatcherTimeline: [] as DispatcherTimeline[],

    isLoaded: false,

    icons: {
      ascArrow: require('@/assets/icon-arrow-asc.svg'),
      descArrow: require('@/assets/icon-arrow-desc.svg'),
    },
  }),
  props: {
    name: {
      type: String,
      required: true,
    },
  },

  async mounted() {
    try {
      const apiResult: HistoryResultAPI = (await axios.get(`${API_URL}?name=${this.name}`)).data;

      this.isLoaded = true;
      if (!apiResult || !apiResult.result) return;

      if (!apiResult.errorMessage) {
        this.dispatcherHistory = apiResult.result.dispatcherHistory;

        this.dispatcherTimeline = this.dispatcherHistory
          .reduce((acc, dispatcher) => {
            const dateStr = new Date(dispatcher.dispatcherFrom).toLocaleDateString('pl-PL').replace(/\./g, '/');

            const timelineDay = acc.find((timeline) => timeline.date == dateStr) || {
              date: dateStr,
              dispatchers: [],
              showTimeline: false,
            };

            timelineDay.dispatchers.push(dispatcher);

            if (!acc.find((timeline) => timeline.date == dateStr)) acc.push(timelineDay);

            return acc;
          }, [] as DispatcherTimeline[])
          .reverse();
      }
    } catch (error) {
      console.error(error);
    }
  },

  methods: {
    toggleTimeline(index: number) {
      this.dispatcherTimeline[index].showTimeline = !this.dispatcherTimeline[index].showTimeline;
    },

    enter(el: HTMLElement) {
      const maxHeight = getComputedStyle(el).height;

      el.style.height = '0px';

      getComputedStyle(el);

      setTimeout(() => {
        el.style.height = maxHeight;
      }, 10);
    },

    afterEnter(el: HTMLElement) {
      el.style.height = 'auto';
    },

    leave(el: HTMLElement) {
      el.style.height = getComputedStyle(el).height;

      setTimeout(() => {
        el.style.height = '0px';
      }, 10);
    },

    timestampToString: (timestamp: number, timeOnly = false): string =>
      new Date(timestamp).toLocaleTimeString('pl-PL', {
        day: timeOnly ? undefined : '2-digit',
        month: timeOnly ? undefined : '2-digit',
        year: timeOnly ? undefined : '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
});
</script>

<style lang="scss" scoped>
.unfold-anim {
  &-leave-active,
  &-enter-active {
    transition: all 100ms ease-out;
    overflow: hidden;
  }
}

.history-list-anim {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active {
    transition: all 100ms ease-out;
  }

  &-leave-active {
    transition: all 100ms ease-out 100ms;
  }
}
.scenery-history {
  height: 600px;
  overflow-y: hidden;

  padding-top: 1em;
}

ul {
  height: 600px;
  overflow-y: scroll;
}

li {
  margin: 1em 0;
  padding: 0 0.5em;

  h3 {
    cursor: pointer;

    display: flex;
    justify-content: center;
    align-items: center;

    background: #444;
    padding: 0.5em;
    margin: 0 auto 0.5em auto;

    max-width: 700px;

    img {
      width: 1.3em;
      vertical-align: middle;

      margin-left: 0.5em;
    }

    &:focus {
      outline: 1px solid white;
    }
  }

  .dispatcher-list {
    display: flex;
    flex-direction: column;
  }

  .dispatcher-item {
    padding: 0.5em 0;
    margin: 0.5em auto;

    background-color: #444;
    border-radius: 0.5em;

    display: grid;
    grid-template-columns: repeat(2, 1fr);

    width: 90%;
    max-width: 400px;
  }
}
</style>
