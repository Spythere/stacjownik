<template>
  <header class="app_header">
    <div class="header_container">
      <div class="header_icons">
        <span class="icons-top">
          <img
            src="/images/icon-pl.svg"
            alt="icon-pl"
            @click="changeLang('en')"
            v-if="currentLang == 'pl'"
          />
          <img src="/images/icon-en.jpg" alt="icon-en" @click="changeLang('pl')" v-else />
        </span>
      </div>

      <div class="header_body">
        <StatusIndicator />

        <span class="header_brand">
          <router-link to="/">
            <img src="/images/stacjownik-header-logo.svg" alt="Stacjownik" />
          </router-link>
        </span>

        <span class="header_info">
          <Clock />

          <div class="info_counter">
            <img src="/images/icon-dispatcher.svg" alt="icon dispatcher" />
            <span class="text--primary">{{ onlineDispatchersCount }}</span>

            <!-- <span class="g-tooltip">
              <b class="text--primary">{{ factorU }}U</b>
              <div class="content">Test</div>
            </span> -->

            <span class="text--grayed"> / </span>
            <span class="text--primary">{{ onlineTrainsCount }}</span>
            <img src="/images/icon-train.svg" alt="icon train" />
          </div>

          <div class="info_region">
            <RegionDropdown />
          </div>
        </span>

        <span class="header_links">
          <router-link class="route" active-class="route-active" to="/" exact>
            {{ $t('app.sceneries') }}
          </router-link>
          /
          <router-link class="route" active-class="route-active" to="/trains">{{
            $t('app.trains')
          }}</router-link>
          /
          <router-link
            class="route"
            active-class="route-active"
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
import { useStore } from '../../store/store';
import StatusIndicator from './StatusIndicator.vue';
import Clock from './Clock.vue';
import RegionDropdown from '../Global/RegionDropdown.vue';

export default defineComponent({
  emits: ['changeLang'],
  props: {
    currentLang: {
      type: String,
      required: true
    }
  },

  setup() {
    return {
      store: useStore()
    };
  },

  methods: {
    changeLang(lang: string) {
      this.$emit('changeLang', lang);
    }
  },

  computed: {
    onlineTrainsCount() {
      return this.store.trainList.filter((train) => train.online).length;
    },

    onlineDispatchersCount() {
      return this.store.onlineSceneryList.length;
    },

    factorU() {
      return this.onlineDispatchersCount == 0
        ? '-'
        : (this.onlineTrainsCount / this.onlineDispatchersCount).toFixed(2);
    }
  },
  components: { StatusIndicator, Clock, RegionDropdown }
});
</script>
<style lang="scss" scoped>
@import '../../styles/variables.scss';
@import '../../styles/responsive.scss';

// HEADER
.app_header {
  display: flex;
  justify-content: center;

  position: relative;
  background-color: $primaryCol;
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

    @include smallScreen {
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

    @include smallScreen {
      transform: translateX(85%);
    }
  }
}

// ICONS
.icons-top {
  img {
    width: 2.5em;
    cursor: pointer;
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
