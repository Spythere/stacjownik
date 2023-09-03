<template>
  <div class="journal-list">
    <transition name="status-anim" mode="out-in">
      <div :key="dataStatus">
        <div class="journal_warning" v-if="store.isOffline">
          {{ $t('app.offline') }}
        </div>

        <Loading v-else-if="dataStatus == DataStatus.Loading" />

        <div v-else-if="dataStatus == DataStatus.Error" class="journal_warning error">
          {{ $t('app.error') }}
        </div>

        <div v-else-if="timetableHistory.length == 0" class="journal_warning">
          {{ $t('app.no-result') }}
        </div>

        <div v-else>
          <transition-group tag="ul" name="list-anim">
            <li
              v-for="{ timetable, stockHistoryComp, stops, showExtraInfo, ...item } in computedTimetableHistory"
              class="journal_item"
              :key="timetable.id"
              @click="showExtraInfo.value = !showExtraInfo.value"
            >
              <div class="journal_item-info">
                <div class="info-general">
                  <span
                    class="general-train"
                    tabindex="0"
                    @click.stop="showTimetable(timetable)"
                    @keydown.enter="showTimetable(timetable)"
                    style="cursor: pointer"
                  >
                    <span class="text--grayed">#{{ timetable.id }}</span>

                    <span class="badges" v-if="timetable.skr || timetable.twr">
                      <span class="train-badge twr" v-if="timetable.twr" :title="$t('general.TWR')">TWR</span>
                      <span class="train-badge skr" v-if="timetable.skr" :title="$t('general.SKR')">SKR</span>
                    </span>

                    <span>
                      <strong class="text--primary">
                        {{ timetable.trainCategoryCode }}
                      </strong>
                      <strong>&nbsp;{{ timetable.trainNo }}</strong>
                    </span>
                    &bull;
                    <strong
                      v-if="timetable.driverLevel !== null"
                      class="level-badge driver"
                      :style="calculateExpStyle(timetable.driverLevel, timetable.driverIsSupporter)"
                    >
                      {{ timetable.driverLevel < 2 ? 'L' : `${timetable.driverLevel}` }}
                    </strong>

                    <strong>{{ timetable.driverName }}</strong>
                  </span>

                  <span class="general-time">
                    <b class="info-date"
                      >{{
                        new Date(timetable.createdAt).getTime() - new Date(timetable.beginDate).getTime() < 0
                          ? localeDateTime(timetable.createdAt, $i18n.locale)
                          : localeDateTime(timetable.beginDate, $i18n.locale)
                      }}
                    </b>

                    <b
                      class="info-badge"
                      :class="{
                        fulfilled: timetable.fulfilled,
                        terminated: timetable.terminated && !timetable.fulfilled,
                        active: !timetable.terminated,
                      }"
                    >
                      {{
                        !timetable.terminated
                          ? $t('journal.timetable-active')
                          : timetable.fulfilled
                          ? $t('journal.timetable-fulfilled')
                          : `${$t('journal.timetable-abandoned')} ${localeTime(timetable.endDate, $i18n.locale)}`
                      }}
                    </b>
                  </span>
                </div>

                <div class="info-route">
                  <b>{{ timetable.route.replace('|', ' - ') }}</b>
                </div>

                <hr />

                <!-- Spis postojów -->
                <div class="stop-list" v-if="showExtraInfo.value == true">
                  <span
                    v-for="(stop, i) in stops.filter((_, i) =>
                      !showExtraInfo.value ? i == 0 || i == stops.length - 1 : true
                    )"
                    class="stop-list-item"
                    :key="stop.stopName"
                    :data-confirmed="stop.confirmed"
                  >
                    <span v-if="i > 0">
                      &gt;
                      <span v-if="!showExtraInfo.value && i == 1 && stops.length > 2">
                        ... (+{{ stops.length - 2 }}) &gt;
                      </span>
                    </span>

                    <span class="stop-name">{{ stop.stopName }}</span>
                    <span v-html="stop.html"></span>
                  </span>
                </div>

                <!-- Status RJ -->
                <div class="info-status" style="margin: 0.5em 0">
                  <ProgressBar
                    :progressPercent="~~((timetable.currentDistance / timetable.routeDistance) * 100)"
                    :progressType="!timetable.fulfilled && timetable.terminated ? 'abandoned' : ''"
                  />

                  <span>
                    <span :style="{ color: timetable.fulfilled ? 'lightgreen' : timetable.terminated ? 'salmon' : '' }">
                      {{ timetable.currentDistance + ' km' }}
                    </span>
                    <span> / </span>
                    <span class="text--primary">{{ timetable.routeDistance }} km</span>
                    |
                    <span class="text--grayed">{{ timetable.confirmedStopsCount }}/{{ timetable.allStopsCount }}</span>
                  </span>

                  <span class="text--grayed" v-if="timetable.currentSceneryName">
                    <b>
                      {{ $t(`journal.${timetable.terminated ? 'last-seen-at' : 'currently-at'}`) }}
                      {{ timetable.currentSceneryName.replace(/.[a-zA-Z0-9]+.sc/, '') }}

                      <span v-if="timetable.currentLocation[0] || timetable.currentLocation[1]">&lpar;</span>

                      <span v-if="timetable.currentLocation[1]">
                        {{ $t('journal.timetable-location-route') }} {{ timetable.currentLocation[1] }}
                      </span>

                      <span v-else-if="timetable.currentLocation[0]">
                        {{ $t('journal.timetable-location-signal') }} {{ timetable.currentLocation[0] }}
                      </span>

                      <span v-if="timetable.currentLocation[0] || timetable.currentLocation[1]">&rpar;</span>
                    </b>
                  </span>
                </div>

                <button class="btn--option btn--show">
                  {{ $t('journal.stock-info') }}
                  <img :src="getIcon(`arrow-${showExtraInfo.value ? 'asc' : 'desc'}`)" alt="Arrow" />
                </button>

                <!-- Dodatkowe informacje -->
                <div class="info-extended" v-if="timetable.stockString && timetable.stockMass && showExtraInfo.value">
                  <hr />

                  <div class="stock-specs">
                    <span class="badge specs-badge">
                      <span>{{ $t('journal.dispatcher-name') }}</span>
                      <span>{{ timetable.authorName }}</span>
                    </span>
                  </div>

                  <div class="stock-specs">
                    <span class="badge specs-badge">
                      <span>{{ $t('journal.stock-max-speed') }}</span>
                      <span>{{ timetable.maxSpeed }}km/h</span>
                    </span>

                    <span class="badge specs-badge">
                      <span>{{ $t('journal.stock-length') }}</span>
                      <span>
                        {{
                          item.currentHistoryIndex.value == 0
                            ? timetable.stockLength
                            : stockHistoryComp[item.currentHistoryIndex.value].stockLength || timetable.stockLength
                        }}m
                      </span>
                    </span>

                    <span class="badge specs-badge">
                      <span>{{ $t('journal.stock-mass') }}</span>
                      <span>
                        {{
                          Math.floor(
                            (item.currentHistoryIndex.value == 0
                              ? timetable.stockMass!
                              : stockHistoryComp[item.currentHistoryIndex.value].stockMass || timetable.stockMass) /
                              1000
                          )
                        }}t
                      </span>
                    </span>
                  </div>

                  <!-- Historia zmian w składzie -->
                  <div class="stock-history" v-if="stockHistoryComp.length > 1">
                    <button
                      class="btn--action"
                      v-for="(sh, i) in stockHistoryComp"
                      :data-checked="i == item.currentHistoryIndex.value"
                      @click.stop="item.currentHistoryIndex.value = i"
                    >
                      {{ sh.updatedAt }}
                    </button>
                  </div>

                  <ul class="stock-list">
                    <li
                      v-for="(car, i) in (item.currentHistoryIndex.value == 0
                        ? timetable.stockString
                        : stockHistoryComp[item.currentHistoryIndex.value].stockString
                      ).split(';')"
                      :key="i"
                    >
                      <img
                        @error="onImageError"
                        :src="`https://rj.td2.info.pl/dist/img/thumbnails/${car.split(':')[0]}.png`"
                        :alt="car"
                      />
                      <div>{{ car.replace(/_/g, ' ').split(':')[0] }}</div>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </transition-group>

          <button
            class="btn btn--option btn--load-data"
            v-if="!scrollNoMoreData && scrollDataLoaded && timetableHistory.length >= 15"
            @click="addHistoryData"
          >
            {{ $t('journal.load-data') }}
          </button>
        </div>
      </div>
    </transition>

    <div class="journal_warning" v-if="scrollNoMoreData">{{ $t('journal.no-further-data') }}</div>
    <div class="journal_warning" v-else-if="!scrollDataLoaded">{{ $t('journal.loading-further-data') }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import imageMixin from '../../mixins/imageMixin';
import modalTrainMixin from '../../mixins/modalTrainMixin';
import styleMixin from '../../mixins/styleMixin';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { TimetableHistory } from '../../scripts/interfaces/api/TimetablesAPIData';
import { useStore } from '../../store/store';
import Loading from '../Global/Loading.vue';
import ProgressBar from '../Global/ProgressBar.vue';

export default defineComponent({
  components: { ProgressBar, Loading },
  mixins: [dateMixin, imageMixin, modalTrainMixin, styleMixin],
  props: {
    timetableHistory: {
      type: Array as PropType<TimetableHistory[]>,
      required: true,
    },
    scrollNoMoreData: {
      type: Boolean,
    },
    scrollDataLoaded: {
      type: Boolean,
    },
    addHistoryData: {
      type: Function as PropType<() => void>,
    },
    dataStatus: {
      type: Number as PropType<DataStatus>,
    },
  },

  data() {
    return {
      DataStatus,
      store: useStore(),
    };
  },

  computed: {
    computedTimetableHistory() {
      return this.timetableHistory.map((timetable) => ({
        timetable,
        stockHistoryComp: timetable.stockHistory
          .slice()
          .reverse()
          .map((h) => {
            const historyData = h.split('@');
            return {
              updatedAt: new Date(Number(historyData[0])).toLocaleTimeString(this.$i18n.locale, {
                hour: '2-digit',
                minute: '2-digit',
              }),
              stockString: historyData[1],
              stockMass: Number(historyData[2]) || undefined,
              stockLength: Number(historyData[3]) || undefined,
            };
          }),
        showExtraInfo: ref(false),
        stops: this.getTimetableStops(timetable),
        currentHistoryIndex: ref(0),
      }));
    },
  },

  methods: {
    getTimetableStops(timetable: TimetableHistory) {
      const stopNames = timetable.sceneriesString.split('%');

      const beginDateHTML = ` (o. ${
        timetable.beginDate != timetable.scheduledBeginDate
          ? `<s class="text--grayed">${this.localeTime(timetable.beginDate, this.$i18n.locale)}</s>`
          : ''
      } <span>${this.localeTime(timetable.scheduledBeginDate, this.$i18n.locale)}</span>)`;

      const endDateHTML = ` (p. ${
        timetable.endDate != timetable.scheduledEndDate && timetable.fulfilled
          ? `<s class="text--grayed">${this.localeTime(timetable.endDate, this.$i18n.locale)}</s>`
          : ''
      } <span>${this.localeTime(timetable.scheduledEndDate, this.$i18n.locale)}</span>)`;

      return stopNames.map((stopName, i) => {
        const confirmed = i < timetable.confirmedStopsCount;

        if (i == 0) return { stopName, html: beginDateHTML, confirmed };
        if (i == stopNames.length - 1) return { stopName, html: endDateHTML, confirmed };

        const departureDateScheduled = this.stringToDate(timetable.checkpointDeparturesScheduled?.at(i));
        const departureDateReal = this.stringToDate(timetable.checkpointDepartures?.at(i));
        const arrivalDateScheduled = this.stringToDate(timetable.checkpointArrivalsScheduled?.at(i));
        const arrivalDateReal = this.stringToDate(timetable.checkpointArrivals?.at(i));

        const arrivalHTML =
          (arrivalDateReal && arrivalDateScheduled && arrivalDateReal?.getTime() != arrivalDateScheduled?.getTime()
            ? `<s class="text--grayed">${this.parseDateToTimeString(arrivalDateScheduled)}</s> `
            : '') + this.parseDateToTimeString(arrivalDateReal || arrivalDateScheduled);

        const departureHTML =
          (departureDateReal &&
          departureDateScheduled &&
          departureDateReal?.getTime() != departureDateScheduled?.getTime()
            ? `<s class="text--grayed">${this.parseDateToTimeString(departureDateScheduled)}</s> `
            : '') + this.parseDateToTimeString(departureDateReal || departureDateScheduled);

        let html = `${arrivalHTML}${departureHTML ? ` / ${departureHTML}` : ''}`;

        if (html) html = ` (${html})`;
        return { stopName, html, confirmed };
      });
    },
    showTimetable(timetable: TimetableHistory) {
      if (!timetable) return;
      if (timetable.terminated) return;
      this.selectModalTrain(timetable.driverName + timetable.trainNo.toString());
    },
    onImageError(e: Event) {
      const imageEl = e.target as HTMLImageElement;
      imageEl.src = this.getImage('unknown.png');
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/animations.scss';
@import '../../styles/variables.scss';
@import '../../styles/responsive.scss';
@import '../../styles/badge.scss';
@import '../../styles/JournalSection.scss';

.journal_item {
  cursor: pointer;
}

hr {
  margin: 0.25em 0;
}

.info {
  &-date {
    margin-right: 0.5em;
  }

  &-badge {
    padding: 0.05em 0.35em;
    color: black;

    &.terminated {
      background-color: salmon;
    }

    &.fulfilled {
      background-color: lightgreen;
    }

    &.active {
      background-color: lightblue;
    }
  }

  &-general {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;

    gap: 0.5em;
    margin-bottom: 0.5em;
  }

  &-route {
    margin: 0.25em 0;
  }

  &-extended {
    margin-top: 0.5em;
  }

  &-status {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5em;
  }
}

.general-train {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25em;
}

ul.stock-list {
  display: flex;
  align-items: flex-end;
  overflow: auto;
  padding-bottom: 0.5em;
  margin-top: 1em;

  li > div {
    text-align: center;
    color: #aaa;
    font-size: 0.9em;
  }

  li > img {
    vertical-align: text-bottom;
    max-height: 60px;
  }
}

.stock-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 0.5em;

  .specs-badge {
    margin: 0;

    span:last-child {
      color: black;
      background-color: $accentCol;
    }
  }
}

// badge.scss
.badges {
  display: flex;
  gap: 0.25em;
}

.stock-history {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 1em;

  button[data-checked='true'] {
    color: $accentCol;
  }
}

.stop-list {
  word-wrap: break-word;
  gap: 0.25em;
  font-size: 0.95em;

  color: #adadad;

  &-item[data-confirmed='true'] {
    color: lightgreen;

    .stop-name {
      font-weight: bold;
    }
  }
}

.btn--show {
  display: flex;
  font-weight: bold;
  padding: 0.2em 0.45em;

  img {
    height: 1.3em;
  }
}

@include smallScreen {
  .journal_item-info {
    text-align: center;
  }

  .info-route {
    display: flex;
    justify-content: center;
  }

  .info-status {
    justify-content: center;
  }

  .btn--show {
    margin: 1em auto 0 auto;
  }

  .info-general,
  .general-train,
  .stock-specs,
  .stock-history {
    justify-content: center;
  }
}
</style>
