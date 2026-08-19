<template>
  <li class="dispatcher-history-entry">
    <div class="entry-info">
      <span class="entry-info-left">
        <div class="station-info">
          <router-link :to="`/journal/dispatchers?search-station=${entry.stationName}`">
            <b>{{ entry.stationName }}</b>
          </router-link>

          <b class="text--grayed"> #{{ entry.stationHash }}</b>
          &bull;

          <LevelBadge
            v-if="entry.dispatcherLevel !== null"
            badge-type="driver"
            :level="entry.dispatcherLevel"
            :is-supporter="entry.dispatcherIsSupporter"
          />

          <FlagIcon
            v-if="entry.dispatcherLanguageId != null"
            :language-id="entry.dispatcherLanguageId"
            width="1.75em"
          />

          <span
            v-if="isCreator(entry.dispatcherName)"
            data-tooltip-type="CreatorTooltip"
            :data-tooltip-content="$t('donations.creator-message')"
          >
            <router-link
              class="text--creator"
              :to="`/journal/dispatchers?search-dispatcher=${entry.dispatcherName}`"
            >
              {{ entry.dispatcherName }}
            </router-link>
          </span>

          <span
            v-else-if="apiStore.donatorsData.includes(entry.dispatcherName)"
            data-tooltip-type="DonatorTooltip"
            :data-tooltip-content="$t('donations.dispatcher-message')"
          >
            <router-link
              class="text--donator"
              :to="`/journal/dispatchers?search-dispatcher=${entry.dispatcherName}`"
            >
              {{ entry.dispatcherName }}
            </router-link>
          </span>

          <router-link
            v-else
            :to="`/journal/dispatchers?search-dispatcher=${entry.dispatcherName}`"
          >
            {{ entry.dispatcherName }}
          </router-link>
        </div>

        <div>
          <span v-if="entry.timestampTo">
            <b>{{ $d(entry.timestampFrom) }}</b>
            {{ timestampToTimeString(entry.timestampFrom) }}
            -
            <b
              v-if="
                new Date(entry.timestampFrom).getDate() != new Date(entry.timestampTo).getDate()
              "
            >
              {{ $d(entry.timestampTo) }}
            </b>
            {{ timestampToTimeString(entry.timestampTo) }} ({{
              humanizeDuration(entry.currentDuration)
            }})
          </span>

          <router-link
            :to="`/scenery?station=${entry.stationName}`"
            class="dispatcher-online"
            v-else
          >
            {{ $t('journal.online-since') }}
            <b>
              {{
                new Date().getDate() != new Date(entry.timestampFrom).getDate()
                  ? $d(entry.timestampFrom)
                  : ''
              }}
              {{ timestampToTimeString(entry.timestampFrom) }}
            </b>
            ({{ humanizeDuration(entry.currentDuration) }})
          </router-link>
        </div>
      </span>

      <span class="entry-info-right">
        <div>
          <span>
            {{ $t('scenery.dispatcher-rate') }}
            <b class="text--primary"> {{ entry.dispatcherRate }}</b>
          </span>
          <button class="btn btn--option" @click="toggleExtraInfo">
            {{ $t('scenery.dispatcher-status-changes') }}
            <b class="text--primary">{{ entry.statusHistory.length }}</b>
          </button>
        </div>

        <b class="region-badge" :aria-describedby="entry.region">
          REGION: {{ getRegionNameById(entry.region) }}
        </b>
      </span>
    </div>

    <div class="entry-extra" v-if="showExtraInfo">
      <ul class="status-list">
        <li v-for="statusItem in entry.statusHistory">
          <b style="margin-right: 0.5em">{{
            timestampToTimeString(parseInt(statusItem.split('@')[0]))
          }}</b>

          <StationStatusBadge
            :dispatcher-status="Number(statusItem.split('@')[1])"
            :is-online="true"
          />
        </li>
      </ul>
    </div>
  </li>
</template>

<script lang="ts" setup>
import { PropType } from 'vue';
import FlagIcon from '@/components/Global/FlagIcon.vue';
import LevelBadge from '@/components/Global/LevelBadge.vue';
import StationStatusBadge from '@/components/Global/StationStatusBadge.vue';
import { humanizeDuration, timestampToTimeString } from '@/composables/time.ts';
import { useApiStore } from '@/store/apiStore';
import { API } from '@/typings/api';
import { getRegionNameById } from '@/utils/regionUtils';
import { isCreator } from '@/utils/userUtils';

const apiStore = useApiStore();

const props = defineProps({
  entry: { type: Object as PropType<API.DispatcherHistory.Data>, required: true },
  showExtraInfo: { type: Boolean, required: true }
});

const emits = defineEmits(['toggleShowExtraInfo']);

function toggleExtraInfo() {
  emits('toggleShowExtraInfo', props.entry.id);
}
</script>

<style lang="scss" scoped>
@use '../../../styles/responsive';
@use '../../../styles/badge';

.region-badge {
  padding: 0 0.25em;
}

.dispatcher-online {
  color: springgreen;
}

.dispatcher-history-entry {
  background-color: #1a1a1a;
  padding: 1em;
}

.entry-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  line-height: 1.75em;
  gap: 0.5em;
}

.entry-info-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  text-align: center;
  gap: 1em;
}

.entry-extra {
  margin-top: 1em;
}

.station-info {
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  align-items: center;
  gap: 0.25em;
  font-weight: bold;
}

.status-list {
  display: flex;
  overflow: auto;
  gap: 0.5em;
}

.status-list > li {
  background-color: #313131;
  padding: 0.2rem 0 0.2rem 0.5em;
  margin: 0.5em 0;
  border-radius: 1em;
}

@include responsive.smallScreen {
  .entry-info {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }

  .station-info {
    justify-content: center;
  }
}
</style>
