<template>
  <transition-group class="journal-list" tag="ul" name="list-anim">
    <li
      v-for="{ timetable, sceneryList, stockHistoryComp, ...item } in computedTimetableHistory"
      class="journal_item"
      :key="timetable.id"
      @click="item.showExtra.value = !item.showExtra.value"
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
            <b class="info-date">{{ localeDay(timetable.beginDate, $i18n.locale) }}</b>
            <b
              class="info-status"
              :class="{
                fulfilled: timetable.fulfilled || timetable.currentDistance >= timetable.routeDistance * 0.9,
                terminated: timetable.terminated && !timetable.fulfilled,
                active: !timetable.terminated,
              }"
            >
              {{
                !timetable.terminated
                  ? $t('journal.timetable-active')
                  : timetable.fulfilled || timetable.currentDistance >= timetable.routeDistance * 0.9
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

        <div class="scenery-list">
          <span
            v-for="(scenery, i) in sceneryList.filter((_, i) =>
              !item.showExtra.value ? i == 0 || i == sceneryList.length - 1 : true
            )"
            :key="scenery.name"
            :class="{ confirmed: scenery.confirmed }"
          >
            <span v-if="i > 0">
              &gt;
              <span v-if="!item.showExtra.value && i == 1 && sceneryList.length > 2"
                >... (+{{ sceneryList.length - 2 }}) &gt;</span
              >
            </span>
            {{ scenery.name }}
            <!-- Data odjazdu ze stacji początkowej -->
            <span v-if="i == 0" v-html="scenery.beginDateHTML"></span>
            <!-- Data przyjazdu do stacji końcowej -->
            <span
              v-if="i == sceneryList.length - 1 || (i == 1 && !item.showExtra.value)"
              v-html="scenery.endDateHTML"
            ></span>
          </span>
        </div>

        <!-- Status RJ -->
        <div style="margin: 0.5em 0">
          <span>
            <b>{{ $t('journal.route-length') }}</b>
            {{ !timetable.fulfilled ? timetable.currentDistance + ' /' : '' }}
            {{ timetable.routeDistance }} km
          </span>
          &bull;
          <span>
            <b>{{ $t('journal.station-count') }}</b>
            {{ timetable.confirmedStopsCount }} /
            {{ timetable.allStopsCount }}
          </span>
          <span class="text--grayed" v-if="!timetable.fulfilled && timetable.currentSceneryName">
            &bull;
            <b>
              {{ $t(`journal.${timetable.terminated ? 'last-seen-at' : 'currently-at'}`) }}
              {{ timetable.currentSceneryName.replace(/.[a-zA-Z0-9]+.sc/, '') }}
            </b>
          </span>
        </div>

        <!-- Nick dyżurnego -->
        <div v-if="timetable.authorName">
          <b class="text--grayed">{{ $t('journal.dispatcher-name') }}&nbsp;</b>
          <router-link class="dispatcher-link" :to="`/journal/dispatchers?dispatcherName=${timetable.authorName}`">
            <b>{{ timetable.authorName }}</b>
          </router-link>
          <span class="text--grayed">
            ({{
              (new Date(timetable.createdAt).getTime() - new Date(timetable.beginDate).getTime() < 0
                ? new Date(timetable.createdAt)
                : new Date(timetable.beginDate)
              ).toLocaleString($i18n.locale, { timeStyle: 'short', dateStyle: 'full' })
            }})
          </span>
        </div>

        <button class="btn--option btn--show">
          {{ $t('journal.stock-info') }}
          <img :src="getIcon(`arrow-${item.showExtra.value ? 'asc' : 'desc'}`)" alt="Arrow" />
        </button>

        <!-- Dodatkowe informacje -->
        <div class="info-extended" v-if="timetable.stockString && timetable.stockMass && item.showExtra.value">
          <hr />

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
                      : stockHistoryComp[item.currentHistoryIndex.value].stockMass || timetable.stockMass) / 1000
                  )
                }}t
              </span>
            </span>
          </div>

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
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import imageMixin from '../../mixins/imageMixin';
import modalTrainMixin from '../../mixins/modalTrainMixin';
import styleMixin from '../../mixins/styleMixin';
import { TimetableHistory } from '../../scripts/interfaces/api/TimetablesAPIData';

export default defineComponent({
  props: {
    timetableHistory: {
      type: Array as PropType<TimetableHistory[]>,
      required: true,
    },
  },

  mixins: [dateMixin, imageMixin, modalTrainMixin, styleMixin],

  computed: {
    computedTimetableHistory() {
      return this.timetableHistory.map((timetable) => ({
        timetable,
        sceneryList: this.getSceneryList(timetable),
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
        showExtra: ref(false),
        currentHistoryIndex: ref(0),
      }));
    },
  },

  methods: {
    getSceneryList(timetable: TimetableHistory) {
      return timetable.sceneriesString.split('%').map((name, i) => {
        const beginDateHTML =
          ' (o. ' +
          (timetable.beginDate != timetable.scheduledBeginDate
            ? `<s class='text--grayed'>${this.localeTime(timetable.beginDate, this.$i18n.locale)}</s> `
            : '') +
          `<span>${this.localeTime(timetable.scheduledBeginDate, this.$i18n.locale)}</span>)`;

        const endDateHTML =
          ' (p. ' +
          (timetable.endDate != timetable.scheduledEndDate && timetable.fulfilled
            ? `<s class='text--grayed'>${this.localeTime(
                timetable.fulfilled ? timetable.endDate : timetable.scheduledEndDate,
                this.$i18n.locale
              )}</s> `
            : '') +
          `<span>${this.localeTime(
            timetable.fulfilled || (timetable.terminated && !timetable.fulfilled)
              ? timetable.scheduledEndDate
              : timetable.endDate,
            this.$i18n.locale
          )}</span>)`;

        return { name, confirmed: i < timetable.confirmedStopsCount, beginDateHTML, endDateHTML };
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

  &-status {
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
}

.general-train {
  display: flex;
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

.stock-history {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 1em;

  button[data-checked='true'] {
    color: $accentCol;
  }
}

.scenery-list {
  color: #adadad;
  span.confirmed {
    color: #a3eba3;
  }
}

.btn--show {
  display: flex;
  margin-top: 1em;
  font-weight: bold;
  padding: 0.2em 0.45em;

  img {
    height: 1.3em;
  }
}

@include smallScreen {
  .info-general {
    flex-direction: column;
  }
  .info-extended {
    text-align: center;
  }

  .info-route {
    display: flex;
    justify-content: center;
  }

  .btn--show {
    margin: 1em auto 0 auto;
  }

  .stock-specs {
    justify-content: center;
  }

  .stock-history {
    justify-content: center;
  }
}
</style>
