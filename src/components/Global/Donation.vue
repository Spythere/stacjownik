<template>
  <div class="donation-modal" @keydown.esc="toggleModal(false)">
    <button
      class="modal_button action btn--image"
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
              <a href="https://discord.gg/x2mpNN3svk" target="_blank">
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
          <button class="modal_button exit btn--image" @click="toggleModal(false)">
            <img src="/images/icon-exit.svg" alt="dollar donation icon" />
            {{ $t('donations.action-exit') }}
          </button>

          <form action="https://www.paypal.com/donate" method="post">
            <input type="hidden" name="hosted_button_id" value="EDB3SKFAHXFTW" />

            <button class="modal_button action btn--image" @click="toggleModal(false)">
              <img src="/images/icon-dollar.svg" alt="dollar donation icon" />
              {{ $t('donations.action-confirm') }}
            </button>
          </form>
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

.modal_button {
  &.action {
    $btnColor: #254069;

    background-color: $btnColor;

    &:hover {
      background-color: lighten($btnColor, 10%);
    }
  }

  &.exit {
    $btnColor: crimson;

    background-color: $btnColor;

    &:hover {
      background-color: lighten($btnColor, 10%);
    }
  }

  @include smallScreen {
    span {
      display: none;
    }
  }
}

.modal-logo {
  position: absolute;
  top: 0;
  left: 50%;

  width: 6em;

  transform: translate(-50%, -50%);
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

  a {
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
  grid-template-columns: repeat(auto-fit, minmax(13em, 1fr));
  gap: 0.5em;

  form button {
    width: 100%;
  }
}
</style>
