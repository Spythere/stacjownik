<template>
  <div class="donation-modal" @keydown.esc="toggleModal(false)">
    <button
      class="btn-toggle btn--image"
      ref="btn"
      @click="toggleModal(true)"
      @focus="toggleModal(false)"
    >
      <img src="/images/icon-dollar.svg" alt="dollar donation icon" />
      <span>{{ $t('donations.button-title') }}</span>
    </button>

    <AnimatedModal :isOpen="isModalOpen" @toggleModal="toggleModal">
      <div class="modal_content">
        <div class="modal_main">
          <h1 v-html="$t('donations.header')"></h1>
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

        <div class="modal_actions">
          <a
            class="modal-action a-button btn--image coffee"
            href="https://buycoffee.to/spythere"
            target="_blank"
          >
            <img src="/images/icon-coffee.png" width="20" alt="buycoffee.to donation" />
            {{ $t('donations.action-buycoffee') }}
          </a>

          <a
            class="modal-action a-button btn--image paypal"
            href="https://www.paypal.com/donate/?hosted_button_id=EDB3SKFAHXFTW"
            target="_blank"
          >
            <img src="/images/icon-dollar.svg" alt="paypal donation" />
            {{ $t('donations.action-paypal') }}
          </a>

          <button class="modal-action btn--image exit" @click="toggleModal(false)">
            <img src="/images/icon-exit.svg" alt="dollar donation icon" />
            {{ $t('donations.action-exit') }}
          </button>
        </div>
      </div>
    </AnimatedModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AnimatedModal from './AnimatedModal.vue';

export default defineComponent({
  props: {
    isModalOpen: Boolean
  },
  emits: ['toggleModal'],

  methods: {
    toggleModal(value: boolean) {
      this.$emit('toggleModal', value);
    }
  },
  components: { AnimatedModal }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

button.btn-toggle {
  $btnColor: #254069;

  background-color: $btnColor;

  &:hover {
    background-color: lighten($btnColor, 5%);
  }

  @include smallScreen {
    span {
      display: none;
    }
  }
}

.modal_content {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 1em;

  font-size: 1.1em;

  & > div {
    padding: 1em;
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
}

.modal_main {
  overflow: auto;

  img {
    max-height: 20px;
    margin-right: 5px;
    vertical-align: text-bottom;
  }
}

.modal_actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5em;

  form button {
    width: 100%;
  }
}

.modal_actions > .modal-action {
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
</style>
