<template>
  <Card :isOpen="isCardOpen" @toggleCard="toggleCard" @keydown.esc="toggleCard(false)">
    <div class="body">
      <div class="content">
        <h1 v-html="$t('donations.header')"></h1>
        <div class="donators-slider" v-if="donatorList.length != 0">
          <span v-html="$t('donations.donator-title', { count: donatorList.length })"></span>

          <transition mode="out-in" name="slider-anim" class="current-name">
            <span :key="displayingName">
              <img src="/images/icon-diamond.svg" alt="donator diamond icon" />
              {{ displayingName }}
            </span>
          </transition>
        </div>
        <br />
        <p v-html="$t('donations.p1')"></p>
        <br />
        <i18n-t keypath="donations.p2" tag="p">
          <template v-slot:b1>
            <b>{{ $t('donations.p2-b1') }}</b>
          </template>
          <template v-slot:b2>
            <b>{{ $t('donations.p2-b2') }}</b>
          </template>
          <template v-slot:b3>
            <b>{{ $t('donations.p2-b3') }}</b>
          </template>
          <template v-slot:link>
            <a class="discord" href="https://discord.gg/x2mpNN3svk" target="_blank">
              {{ $t('donations.p2-a1') }}
            </a>
          </template>
        </i18n-t>
        <br />
        <p v-html="$t('donations.p3')"></p>
        <br />
        <i18n-t keypath="donations.p4" tag="p">
          <template v-slot:img>
            <img src="/images/icon-diamond.svg" alt="donator diamond icon" />
          </template>

          <template v-slot:b1>
            <b>{{ $t('donations.p4-b1') }}</b>
          </template>

          <template v-slot:b2>
            <b>{{ $t('donations.p4-b2') }}</b>
          </template>
        </i18n-t>
        <br />
        <i
          v-html="$t('donations.p5')"
          style="display: flex; justify-content: flex-end; text-align: right"
        >
        </i>
      </div>

      <div class="actions-container">
        <a
          class="action a-button btn--image coffee"
          href="https://buycoffee.to/spythere"
          target="_blank"
          ref="action"
        >
          <img src="/images/icon-coffee.png" width="20" alt="buycoffee.to donation" />
          {{ $t('donations.action-buycoffee') }}
        </a>

        <a
          class="action a-button btn--image paypal"
          href="https://www.paypal.com/donate/?hosted_button_id=EDB3SKFAHXFTW"
          target="_blank"
        >
          <img src="/images/icon-dollar.svg" alt="paypal donation" />
          {{ $t('donations.action-paypal') }}
        </a>

        <button class="action btn--image exit" @click="toggleCard(false)">
          <img src="/images/icon-exit.svg" alt="dollar donation icon" />
          {{ $t('donations.action-exit') }}
        </button>
      </div>
    </div>
  </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useApiStore } from '../../store/apiStore';
import Card from './Card.vue';

export default defineComponent({
  components: { Card },
  props: {
    isCardOpen: Boolean
  },

  emits: ['toggleCard'],

  watch: {
    isCardOpen(val: boolean) {
      this.running = val;
      this.lastUpdate = Date.now();

      this.$nextTick(() => {
        if (val) (this.$refs['action'] as HTMLElement).focus();
      });
    }
  },

  created() {
    this.runUpdate();
  },

  data() {
    return {
      apiStore: useApiStore(),
      displayingIndex: 0,
      lastUpdate: 0,
      running: false
    };
  },

  computed: {
    displayingName() {
      return this.donatorList[this.displayingIndex];
    },

    donatorList() {
      return this.apiStore.donatorsData.slice().sort(() => Math.sign(Math.random() * -2 + 1));
    }
  },

  methods: {
    toggleCard(value: boolean) {
      this.$emit('toggleCard', value);
    },

    runUpdate() {
      if (Date.now() >= this.lastUpdate + 2000 && this.running) {
        this.displayingIndex = (this.displayingIndex + 1) % this.donatorList.length;
        this.lastUpdate = Date.now();
      }

      window.requestAnimationFrame(this.runUpdate);
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

.body {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 1em;

  font-size: 1.1em;

  max-width: 820px;
}

.content {
  overflow: auto;
  overflow-x: hidden;
  padding: 1em;
}

img {
  max-height: 20px;
  margin-right: 5px;
  vertical-align: text-bottom;
}

h1 {
  font-size: 1.95em;
  text-align: center;
}

p {
  text-align: justify;
}

a.discord {
  text-decoration: underline;
}

.actions-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5em;
  padding: 1em;

  form button {
    width: 100%;
  }
}

.actions-container > .action {
  &.paypal {
    $btnColor: #254069;

    background-color: $btnColor;

    &:hover {
      background-color: lighten($btnColor, 5%);
    }
  }

  &.coffee {
    $btnColor: #009255;
    background-color: $btnColor;

    &:hover {
      background-color: lighten($btnColor, 5%);
    }
  }

  &.exit {
    $btnColor: #686868;
    background-color: $btnColor;

    &:hover {
      background-color: lighten($btnColor, 5%);
    }
  }
}

.donators-slider {
  text-align: center;
  line-height: 30px;

  .current-name {
    backface-visibility: hidden;
    display: block;
    font-weight: bold;
    word-wrap: break-word;
    color: var(--clr-donator);
  }
}

.slider-anim {
  &-move,
  &-enter-active,
  &-leave-active {
    transition: all 150ms ease-in-out;
  }

  &-enter-from,
  &-leave-to {
    opacity: 0;
  }
}
</style>
