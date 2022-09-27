<template>
  <header class="app_header">
    <div class="header_container">
      <div class="header_icons">
        <span class="icons-top">
          <img :src="getIcon('pl')" alt="icon-pl" @click="changeLang('en')" v-if="currentLang == 'pl'" />
          <img :src="getIcon('en', 'jpg')" alt="icon-en" @click="changeLang('pl')" v-else />
        </span>

        <span class="icons-bottom">
          <a href="https://www.paypal.com/paypalme/spythere" target="_blank">
            <img :src="getIcon('dollar')" alt="icon paypal" />
          </a>

          <a href="https://discord.gg/x2mpNN3svk" target="_blank">
            <img :src="getIcon('discord', 'png')" alt="icon discord" />
          </a>
        </span>
      </div>

      <div class="header_body">
        <StatusIndicator />

        <span class="header_brand">
          <img :src="getImage('stacjownik-header-logo.svg')" alt="Stacjownik" />
        </span>

        <span class="header_info">
          <Clock />

          <div class="info_counter">
            <img :src="getIcon('dispatcher')" alt="icon dispatcher" />
            <span class="text--primary">{{ onlineDispatchersCount }}</span>
            <span class="text--grayed"> / </span>
            <span class="text--primary">{{ onlineTrainsCount }}</span>
            <img :src="getIcon('train')" alt="icon train" />
          </div>

          <span class="info_region">
            <SelectBox :itemList="computedRegions" :defaultItemIndex="0" @selected="changeRegion" />
          </span>
        </span>

        <span class="header_links">
          <router-link class="route" active-class="route-active" to="/" exact>
            {{ $t('app.sceneries') }}
          </router-link>
          /
          <router-link class="route" active-class="route-active" to="/trains">{{ $t('app.trains') }}</router-link>
          /
          <router-link class="route" active-class="route-active" to="/journal/timetables">
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
import options from '../../data/options.json';
import imageMixin from '../../mixins/imageMixin';
import SelectBox from '../Global/SelectBox.vue';
import StatusIndicator from './StatusIndicator.vue';
import Clock from './Clock.vue';

export default defineComponent({
    emits: ["changeLang"],
    mixins: [imageMixin],
    props: {
        currentLang: {
            type: String,
            required: true,
        },
    },
    setup() {
        return {
            store: useStore(),
        };
    },
    methods: {
        changeRegion(region: {
            id: string;
            value: string;
        }) {
            this.store.changeRegion(region);
        },
        changeLang(lang: string) {
            this.$emit("changeLang", lang);
        },
    },
    computed: {
        onlineTrainsCount() {
            return this.store.trainList.filter((train) => train.online).length;
        },
        onlineDispatchersCount() {
            return this.store.stationList.filter((station) => station.onlineInfo && station.onlineInfo.region == this.store.region.id).length;
        },
        computedRegions() {
            return options.regions.map((region) => {
                const regionStationCount = this.store.apiData.stations?.filter((station) => station.region == region.id && station.isOnline).length || 0;
                const regionTrainCount = this.store.apiData.trains?.filter((train) => train.region == region.id && train.online).length || 0;
                return {
                    id: region.id,
                    value: `${region.value} <div class='text--grayed'>${regionStationCount} / ${regionTrainCount}</div>`,
                    selectedValue: region.value,
                };
            });
        },
    },
    components: { SelectBox, StatusIndicator, Clock }
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
    max-width: 21em;

    @include smallScreen {
      max-width: 18em;
    }
  }

  &_container {
    display: flex;
    justify-content: center;
    position: relative;

    width: 1350px;
    padding: 0.5em 0.3em 0 0.3em;
    border-radius: 0 0 1em 1em;
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
    max-width: 100%;

    font-size: 1.2em;
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
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
    padding: 0.5em 0.5em;

    @include smallScreen() {
      right: auto;
      left: 0.75em;
      padding: 0;

      align-items: center;
    }
  }
}

// ICONS
.icons {
  position: relative;

  &-top {
    img {
      width: 2.5em;

      cursor: pointer;
    }

    margin-bottom: 0.5em;
  }

  &-bottom {
    display: flex;

    a {
      margin-left: 0.6em;
      user-select: none;
    }

    img {
      width: 1.9em;
    }

    @include smallScreen() {
      flex-direction: column;

      a {
        margin: 0.25em 0;
      }
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

// REGION SELECTION
.info_region {
  color: white;
  font-weight: bold;

  display: flex;
  justify-content: flex-end;

  .select-box_content button {
    background-color: transparent;
    font-weight: bold;
    padding: 0.1em 0.5em;
    color: paleturquoise;
  }

  .options {
    font-size: 0.9em;
  }
}
</style>