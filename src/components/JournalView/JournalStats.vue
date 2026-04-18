<template>
  <div
    class="journal-stats dropdown"
    v-if="!mainStore.isOffline"
    @keydown.esc="isDropdownOpen = false"
  >
    <div class="dropdown_background" v-if="isDropdownOpen" @click="isDropdownOpen = false"></div>

    <div class="actions-bar">
      <button class="btn--filled btn--image" @click="toggleDropdown">
        <img :src="`/images/icon-stats.svg`" alt="stats icon" />
        {{ $t('journal.daily-stats.button') }}
      </button>

      <button
        class="btn--filled btn--image"
        :data-disabled="chosenPlayerId == -1"
        @click="navigateToProfile"
      >
        <img :src="`/images/icon-user.svg`" alt="user icon" />
        {{ $t('profile.journal-button') }}
      </button>
    </div>

    <transition name="dropdown-anim">
      <div class="dropdown_wrapper" v-if="isDropdownOpen">
        <keep-alive>
          <JournalDailyStats />
        </keep-alive>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useMainStore } from '../../store/mainStore';
import JournalDailyStats from './JournalDailyStats.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  chosenPlayerId: {
    type: Number,
    required: true
  }
});

const mainStore = useMainStore();
const isDropdownOpen = ref(false);

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function navigateToProfile() {
  if (props.chosenPlayerId == -1) return;

  router.push(`/profile?playerId=${props.chosenPlayerId}`);
}
</script>

<style lang="scss" scoped>
@use '../../styles/dropdown';
@use '../../styles/dropdown-filters';

.dropdown_wrapper {
  left: auto;
  right: 0;
  max-width: 700px;
  top: 3.5em;
}
</style>
