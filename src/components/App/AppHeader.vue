<template>
  <header class="app_header">
    <div class="header_container">
      <div class="header_body">
        <StatusIndicator />

        <span class="header_brand">
          <router-link to="/">
            <img
              v-if="isChristmas"
              src="/images/stacjownik-header-logo-christmas.svg"
              alt="Stacjownik logo (christmas)"
            />
            <img v-else src="/images/stacjownik-header-logo.svg" alt="Stacjownik logo" />
          </router-link>
        </span>

        <span class="header_info">
          <Clock />

          <div class="info_counter">
            <img src="/images/icon-dispatcher.svg" alt="icon dispatcher" />
            <span class="text--primary">{{ onlineDispatchersCount }}</span>

            <span class="text--grayed"> / </span>
            <span class="text--primary">{{ onlineTrainsCount }}</span>
            <img src="/images/icon-train.svg" alt="icon train" />
          </div>

          <div class="info_region">
            <RegionDropdown />
          </div>
        </span>

        <span class="header_links">
          <router-link class="route-link" active-class="route-link-active" to="/" exact>
            {{ $t('app.sceneries') }}
          </router-link>
          /
          <router-link class="route-link" active-class="route-link-active" to="/trains">{{
            $t('app.trains')
          }}</router-link>
          /
          <router-link
            class="route-link"
            active-class="route-link-active"
            :data-active="$route.path.startsWith('/journal')"
            to="/journal"
          >
            {{ $t('app.journal') }}
          </router-link>
        </span>
      </div>
    </div>
  </header>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';
import StatusIndicator from './StatusIndicator.vue';
import Clock from './Clock.vue';
import RegionDropdown from '../Global/RegionDropdown.vue';

export default defineComponent({
  components: { StatusIndicator, Clock, RegionDropdown },

  setup() {
    return {
      store: useMainStore()
    };
  },

  computed: {
    onlineTrainsCount() {
      return this.store.trainList.filter((train) => train.region == this.store.region.id).length;
    },

    onlineDispatchersCount() {
      return this.store.activeSceneryList.filter(
        (scenery) => scenery.region == this.store.region.id && scenery.dispatcherId != -1
      ).length;
    },

    isChristmas() {
      const date = new Date();

      return date.getUTCMonth() == 11 && date.getUTCDate() >= 6 && date.getUTCDate() <= 31;
    }
  }
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

// HEADER
.app_header {
  display: flex;
  justify-content: center;

  position: relative;
  background-color: #2c2c2c;
}

.header {
  &_body {
    position: relative;
    max-width: 20em;
  }

  &_container {
    display: flex;
    justify-content: center;

    border-radius: 0 0 1em 1em;

    @include responsive.smallScreen {
      position: relative;
      margin-top: 0.5em;
    }
  }

  &_brand {
    display: flex;

    img {
      width: 100%;

      margin: 0 auto;
    }
  }

  &_info {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    font-size: 1.15em;
  }

  &_links {
    display: flex;
    justify-content: center;

    border-radius: 0.7em;

    font-size: 1.25em;
    padding: 0.5em;
  }

  &_icons {
    position: absolute;
    right: 0;
    top: 0;

    padding: 0.5em;

    @include responsive.smallScreen {
      transform: translateX(85%);
    }
  }
}

// COUNTER
.info_counter {
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    margin: 0 0.15em;
  }

  img {
    width: 1.35em;
  }
}

.info_region {
  display: flex;
  justify-content: flex-end;
}
</style>
