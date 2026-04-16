<template>
  <div class="scenery-top-list">
    <h2 class="header">{{ t('scenery.top-list.header') }}</h2>

    <div class="top-actions">
      <div class="actions-modes">
        <button
          v-for="mode in availableModes"
          :class="`btn btn--option ${mode == currentListMode ? 'checked' : ''}`"
          @click="selectListMode(mode)"
        >
          {{ t(`scenery.top-list.mode-${mode}`) }}
        </button>
      </div>

      <div class="actions-scopes">
        <button
          v-for="scope in availableScopes"
          :class="`btn btn--option ${scope == currentListScope ? 'checked' : ''}`"
          @click="selectListScope(scope)"
        >
          {{ t(`scenery.top-list.scope-${scope}`) }}
        </button>
      </div>
    </div>

    <div class="rating-list-wrapper">
      <Loading v-if="listState == Status.Data.Loading" />
      <div v-else-if="listState == Status.Data.Error">Ups, coś poszło nie tak...</div>

      <ul v-else-if="currentListMode == 'likes'">
        <li v-for="(value, i) in topLikesList">
          <div>
            {{ t('scenery.top-list.place', i + 1) }} -
            <router-link :to="`/profile?playerId=${value.dispatcherId}`">{{
              value.dispatcherName
            }}</router-link>
          </div>
          <div>
            <b class="text--primary">{{ t('scenery.top-list.like-count', value.sumRate) }}</b>
          </div>
        </li>
      </ul>

      <ul v-else>
        <li v-for="(value, i) in topDispatchersList">
          <div>
            {{ t('scenery.top-list.place', i + 1) }} -
            <router-link :to="`/profile?playerId=${value.dispatcherId}`">{{
              value.dispatcherName
            }}</router-link>
          </div>
          <div>
            <b class="text--primary">{{ t('scenery.top-list.dispatch-count', value.count) }}</b>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onActivated, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApiStore } from '../../store/apiStore';
import { Station, ActiveScenery, Status } from '../../typings/common';
import Loading from '../Global/Loading.vue';
import { useMainStore } from '../../store/mainStore';

interface DispatcherTopCount {
  dispatcherName: string;
  dispatcherId: number;
  count: number;
}

interface LikesTopCount {
  dispatcherName: string;
  dispatcherId: number;
  sumRate: number;
}

const { t } = useI18n();

const apiStore = useApiStore();
const mainStore = useMainStore();

defineOptions({
  name: 'SceneryTopList'
});

const props = defineProps({
  station: {
    type: Object as PropType<Station>
  },

  onlineScenery: {
    type: Object as PropType<ActiveScenery>
  }
});

const availableModes = ['likes', 'dispatchers'] as const;
const availableScopes = ['name', 'hash'] as const;

type ListMode = (typeof availableModes)[number];
type ListScope = (typeof availableScopes)[number];

const currentListMode = ref<ListMode>('likes');
const currentListScope = ref<ListScope>('name');

const listState = ref<Status.Data>(Status.Data.Loading);

const topLikesList = ref<LikesTopCount[]>([]);
const topDispatchersList = ref<DispatcherTopCount[]>([]);

onActivated(() => {
  fetchTopDispatchersList();
});

function selectListMode(mode: ListMode) {
  currentListMode.value = mode;
  fetchTopDispatchersList();
}

function selectListScope(scope: ListScope) {
  currentListScope.value = scope;
  fetchTopDispatchersList();
}

async function fetchTopDispatchersList() {
  const searchedStationValue =
    currentListScope.value == 'name'
      ? props.station?.name
      : apiStore.sceneryData.find((sc) => sc.name == props.station!.name)?.hash;

  console.log(searchedStationValue);

  topDispatchersList.value = [];
  topLikesList.value = [];

  if (!searchedStationValue) {
    listState.value = Status.Data.Loaded;
    return;
  }

  try {
    listState.value = Status.Data.Loading;

    const response = await apiStore.client.get(
      `api/getSceneryTop${currentListMode.value}By${currentListScope.value}?${currentListScope.value}=${searchedStationValue}&countLimit=40`
    );

    if (currentListMode.value == 'dispatchers') {
      topDispatchersList.value = response as DispatcherTopCount[];
    } else {
      topLikesList.value = response as LikesTopCount[];
    }

    listState.value = Status.Data.Loaded;
  } catch (error) {
    listState.value = Status.Data.Error;
    console.error(error);
  }
}
</script>

<style lang="scss" scoped>
.scenery-top-list {
  display: grid;
  grid-template-rows: auto auto 1fr;
  overflow: hidden;
  gap: 1em;
}

.top-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5em 1.5em;
}

.actions-modes,
.actions-scopes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  font-weight: bold;

  button {
    font-weight: bold;
  }
}

.rating-list-wrapper {
  overflow: auto;
}

.rating-list-wrapper > ul {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  align-items: center;
  gap: 0.65em;
  padding-right: 0.5em;
}

.rating-list-wrapper > ul > li {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  padding: 0.25em;
  background-color: #2b2b2b;
  height: 100%;

  line-height: 1.5em;

  a {
    font-weight: bold;
  }
}
</style>
