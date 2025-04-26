<template>
  <div class="driver-not-found">
    <h2>&olcross; {{ $t('trains.driver-not-found-header') }}</h2>

    <p class="text--grayed">
      {{ $t('trains.driver-not-found-desc-1') }} <br />
      {{ $t('trains.driver-not-found-desc-2') }}
      <router-link to="/journal/timetables"
        >{{ $t('trains.driver-not-found-journal') }} </router-link
      >!
    </p>

    <p v-if="props.trainId && otherDriverTrains.length > 0">
      <i18n-t keypath="trains.driver-not-found-others">
        <template v-slot:driver>
          <b>{{ otherDriverTrains[0].driverName }}</b>
        </template>
      </i18n-t>
    </p>

    <div class="other-driver-trains">
      <template v-for="(train, i) in otherDriverTrains">
        <router-link :to="`/driver?trainId=${train.id}`">
          {{ train.trainNo }}
          | {{ regions.find((r) => r.id == train.region)?.name ?? 'PL1' }}
        </router-link>
      </template>
    </div>

    <div style="margin-top: 1em">
      <router-link to="/">&lt;&lt; {{ $t('trains.driver-not-found-return') }}</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMainStore } from '../../store/mainStore';
import { regions } from '../../data/options.json';

const mainStore = useMainStore();

const props = defineProps({
  trainId: {
    type: String
  }
});

const otherDriverTrains = computed(() => {
  return mainStore.trainList.filter(
    (train) =>
      train.driverId == Number(props.trainId?.split('|')[0]) &&
      (train.timetableData || train.online || train.lastSeen >= Date.now() - 60000)
  );
});
</script>

<style lang="scss" scoped>
.driver-not-found {
  background-color: var(--clr-view-bg);
  text-align: center;
  padding: 1em;
  border-radius: 0.5em 0.5em;

  p {
    padding: 0.5em 0;
  }

  a {
    text-decoration: underline;
    color: white;
  }
}

.other-driver-trains {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5em;
}
</style>
