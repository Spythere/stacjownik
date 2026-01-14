<template>
  <Card :is-open="props.isCardOpen">
    <div class="body-content">
      <h1>{{ $t('welcome.title') }}</h1>

      <div class="language-select">
        <button :data-active="$i18n.locale == 'pl'" @click="store.changeLocale('pl')">
          <FlagIcon :language-id="0" width="2.5em" />
        </button>

        <button :data-active="$i18n.locale == 'en'" @click="store.changeLocale('en')">
          <FlagIcon :language-id="1" width="2.5em" />
        </button>
      </div>

      <section class="app-description">
        <i18n-t keypath="welcome.app-desc" tag="p">
          <template v-slot:b1>
            <b>{{ $t('welcome.app-desc-b1') }}</b>
          </template>

          <template v-slot:link>
            <a href="https://td2.info.pl/" class="link" target="_blank">Train Driver 2</a>
          </template>
        </i18n-t>
      </section>

      <section class="tabs">
        <div class="tab-description">
          <h2 class="text--primary">{{ $t('welcome.sceneries-header') }}</h2>
          <hr />
          <i18n-t keypath="welcome.sceneries-desc" tag="p">
            <template v-slot:b1>
              <b>{{ $t('welcome.sceneries-desc-b1') }}</b>
            </template>
          </i18n-t>
        </div>

        <div class="tab-description">
          <h2 class="text--primary">{{ $t('welcome.trains-header') }}</h2>
          <hr />
          <i18n-t keypath="welcome.trains-desc" tag="p">
            <template v-slot:b1>
              <b>{{ $t('welcome.trains-desc-b1') }}</b>
            </template>
          </i18n-t>
        </div>

        <div class="tab-description">
          <h2 class="text--primary">{{ $t('welcome.journal-header') }}</h2>
          <hr />
          <i18n-t keypath="welcome.journal-desc" tag="p">
            <template v-slot:b1>
              <b>{{ $t('welcome.journal-desc-b1') }}</b>
            </template>
          </i18n-t>
        </div>
      </section>

      <section class="other-apps">
        <b class="text--primary">
          {{ $t('welcome.other-apps') }}
        </b>

        <div class="apps-grid">
          <a class="app-item" href="https://pojazdownik-td2.web.app/" target="_blank">
            <img src="/images/icon-pojazdownik.svg" alt="pojazdownik app logo" />
            <h3 class="text--primary">Pojazdownik</h3>
            <p>{{ $t('welcome.pojazdownik-desc') }}</p>
          </a>

          <a class="app-item" href="https://generator-td2.web.app/" target="_blank">
            <img src="/images/icon-gnr.svg" alt="generator app logo" />
            <h3 class="text--primary">GeneraTOR</h3>
            <p>{{ $t('welcome.generator-desc') }}</p>
          </a>

          <a class="app-item" href="https://srjp-td2.web.app/" target="_blank">
            <img src="/images/icon-srjp.svg" alt="srjp app logo" />
            <h3 class="text--primary">Rozkładownik</h3>
            <p>{{ $t('welcome.srjp-desc') }}</p>
          </a>
        </div>
      </section>

      <section class="bottom-info">
        <i18n-t keypath="welcome.donation-info" tag="div" class="donation-info">
          <template v-slot:icon1>
            <img src="/images/icon-diamond.svg" alt="diamond icon" width="25" />
            <span class="text--donator">&nbsp;{{ $t('welcome.donation-info-icon1-text') }}</span>
          </template>
        </i18n-t>

        <i18n-t keypath="welcome.discord-info" tag="div" class="discord-info">
          <template v-slot:discord>
            <a href="https://discord.gg/x2mpNN3svk" class="link" target="_blank">
              <b class="text--discord">{{ $t('welcome.discord-info-link-text') }}</b>
            </a>
          </template>
        </i18n-t>

        <div class="bottom-text">
          <i>{{ $t('welcome.bottom-text') }}</i>
        </div>

        <div class="bottom-actions">
          <button class="btn btn--action" @click="toggleCard(false)">
            {{ $t('welcome.button-confirm') }}
          </button>
        </div>
      </section>
    </div>
  </Card>
</template>

<script setup lang="ts">
import Card from '../Global/Card.vue';
import { useMainStore } from '../../store/mainStore';
import FlagIcon from '../Global/FlagIcon.vue';

const store = useMainStore();

const emit = defineEmits(['toggleCard']);
const props = defineProps({
  isCardOpen: Boolean
});

function toggleCard(state: boolean) {
  emit('toggleCard', state);
}
</script>

<style lang="scss" scoped>
.body-content {
  max-width: 800px;
  min-height: 900px;
  padding: 1em 0.5em;

  text-align: center;
  font-size: 1.1em;
}

hr {
  margin-bottom: 0.5em;
}

a.link {
  text-decoration: underline;

  img {
    vertical-align: middle;
    margin-right: 0.2em;
  }
}

.language-select {
  display: flex;
  justify-content: center;
  margin: 0.5em 0;

  button[data-active='false'] ::v-deep(img) {
    opacity: 0.5;
  }
}

.app-description {
  margin: 1em 0;
}

.tab-description {
  margin-top: 0.5em;
}

.other-apps {
  font-weight: bold;
  margin: 1em 0;
  font-size: 1.1em;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1em;
  padding: 1em;
}

.apps-grid > a.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  padding: 1em;
  background-color: #2b2b2b;
  transition: background-color 100ms ease-in-out;
  border-radius: 0.5em;

  &:hover {
    background-color: #3b3b3b;
  }

  img {
    width: 2.5em;
  }
}

.donation-info {
  font-weight: bold;
  font-size: 1.1em;

  img {
    vertical-align: middle;
  }
}

.discord-info {
  margin-top: 1em;
  font-weight: bold;

  img {
    vertical-align: middle;
  }
}

.bottom-text {
  margin: 1em 0;
  font-weight: bold;
  font-size: 1.2em;
}

.bottom-actions {
  display: flex;
  justify-content: center;
  margin-top: 1em;

  font-size: 1.25em;
}
</style>
