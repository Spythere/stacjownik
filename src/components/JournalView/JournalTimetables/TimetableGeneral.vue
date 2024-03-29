<template>
  <div class="item-general">
    <span class="general-train">
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

      <strong
        v-if="isDonator(timetable.driverName)"
        class="text--donator"
        :title="$t('donations.driver-message')"
      >
        {{ timetable.driverName }}
      </strong>

      <strong v-else>
        {{ timetable.driverName }}
      </strong>
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
          active: !timetable.terminated
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

      <button
        v-if="timetable.terminated == false"
        class="btn--image btn--action btn-timetable"
        @click.stop="showTimetable(timetable, $event.currentTarget)"
      >
        <img src="/images/icon-train.svg" alt="" />
        {{ $t('journal.timetable-online-button') }}
      </button>
    </span>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

import { API } from '../../../typings/api';
import dateMixin from '../../../mixins/dateMixin';
import modalTrainMixin from '../../../mixins/modalTrainMixin';
import styleMixin from '../../../mixins/styleMixin';
import donatorMixin from '../../../mixins/donatorMixin';

export default defineComponent({
  mixins: [dateMixin, modalTrainMixin, styleMixin, donatorMixin],

  props: {
    timetable: {
      type: Object as PropType<API.TimetableHistory.Data>,
      required: true
    }
  },

  methods: {
    showTimetable(timetable: API.TimetableHistory.Data, target: EventTarget | null) {
      if (timetable?.terminated) return;

      this.selectModalTrain(timetable.driverName + timetable.trainNo.toString(), target);
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../../styles/responsive.scss';
@import '../../../styles/badge.scss';

.item-general {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  gap: 0.5em;
  margin-bottom: 0.5em;
}

.info-date {
  margin-right: 0.5em;
}

.badges {
  display: flex;
  gap: 0.25em;
}

.info-badge {
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

.general-train {
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.25em;
}

.btn-timetable {
  display: inline-block;
  padding: 0.1em 0.4em;
  margin-left: 0.5em;

  img {
    vertical-align: top;
  }
}

@include smallScreen {
  .item-general {
    justify-content: center;
  }
}
</style>
