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
          {{ i + 1 }}. miejsce - <b>{{ value.dispatcherName }}</b> -
          <b class="text--primary">{{ value.sumRate }} łapek</b>
        </li>
      </ul>

      <ul v-else>
        <li v-for="(value, i) in topDispatchersList">
          {{ i + 1 }}. miejsce - <b>{{ value.dispatcherName }}</b> -
          <b class="text--primary">{{ value.count }} dyżurów</b>
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
  count: number;
}

interface LikesTopCount {
  dispatcherName: string;
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
      `api/getSceneryTop${currentListMode.value}By${currentListScope.value}?${currentListScope.value}=${searchedStationValue}`
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

.rating-list-wrapper > ul > li {
  padding: 0.5em;
  margin: 1em 0.5em;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }

  background-color: #2b2b2b;
}
</style>
