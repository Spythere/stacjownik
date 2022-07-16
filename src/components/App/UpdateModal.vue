<template>
  <transition name="modal-anim">
    <section class="update-modal card" v-if="releaseData && modalOpen">
      <h2 class="modal_header text--primary">
        <img :src="icons.logo" alt="stacjownik logo" />

        {{ releaseData.tag_name }}
      </h2>

      <div class="horizontal"></div>

      <div class="modal_content">
        <h3>{{ $t('update.title') }}</h3>
        <a :href="releaseData.html_url" target="_blank">{{ $t('update.release-link') }}</a>

        <br />
        <br />

        <p>{{ $t('update.paragraph1') }}</p>

        <!-- <div class="modal_changelog" v-html="markdownReleaseBody"></div> -->
      </div>

      <div class="modal_actions">
        <button class="btn btn--option" @click="modalOpen = false">{{ $t('update.confirm-button') }}</button>
      </div>
    </section>
  </transition>
</template>

<script lang="ts">
import axios from 'axios';
import packageInfo from '../../../package.json';

import { ReleaseAPIData } from '@/scripts/interfaces/github_api/ReleaseAPIData';
import { defineComponent } from '@vue/runtime-core';

import StorageManager from '@/scripts/managers/storageManager';
import { useStore } from '@/store/store';

const GH_LASTEST_RELEASE_URL = 'https://api.github.com/repos/Spythere/stacjownik/releases/latest';

export default defineComponent({
  mounted() {
    this.fetchReleases();
  },

  data() {
    return {
      modalOpen: false,

      releaseData: null as ReleaseAPIData | null,

      icons: {
        logo: require('@/assets/stacjownik-header-logo.svg'),
      },
    };
  },

  setup() {
    return {
      store: useStore()
    }
  },

  methods: {
    async fetchReleases() {
      const storedVersion = StorageManager.getStringValue('appVersion');
      const appVersion = packageInfo.version;

      // Zmiana
      if (appVersion != storedVersion) {
        StorageManager.setStringValue('appVersion', appVersion);

        // Znajdź changelog na GitHubie, jeśli jest pokaż modal
        try {
          const releaseData: ReleaseAPIData = await (await axios.get(GH_LASTEST_RELEASE_URL)).data;
          if (!releaseData) return;

          const lastReleaseVersion = releaseData.tag_name.slice(1);

          if (lastReleaseVersion == appVersion) {
            this.releaseData = releaseData;        
            this.modalOpen = true;

            StorageManager.setStringValue('releaseURL', releaseData.html_url);
          }
        } catch (error) {
          console.error(`Wystąpił błąd podczas pobierania danych z API GitHuba: ${error}`);
        }
      }
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/card.scss';
@import '../../styles/responsive.scss';


.modal-anim {
  &-enter-active,
  &-leave-active {
    transition: all $animDuration $animType;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.45);
  }
}

.update-modal {
  text-align: center;
  background-color: var(--clr-secondary);

  padding: 1em;
}

.horizontal {
  margin: 1em 0;

  height: 2px;
  width: 100%;
  background-color: white;
}

.modal_header {
  font-size: 1.6em;

  img {
    width: 50%;
    vertical-align: text-top;
  }
}

.modal_content {
  font-size: 1.1em;

  a {
    text-decoration: underline;
  }
}

.modal_actions {
  margin-top: 2em;

  button {
    color: white;
    padding: 0.5em;
    font-size: 1.2em;

    background-color: black;
  }
}

.modal_changelog {
  font-size: 0.8em;
  margin-top: 2em;
}

@include smallScreen {
  .update-modal {
    height: auto;
    max-width: 95%;
  }
}
</style>
