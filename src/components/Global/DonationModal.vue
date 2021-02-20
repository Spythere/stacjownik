<template>
  <div class="modal" v-if="!modalHidden">
    <div class="modal_content">
      <span class="modal_title">Grosza daj Stacjownikowi...</span>
      <div class="modal_body">
        <div class="modal_body-header">
          Stacjownik to projekt całkowicie darmowy dla wszystkich.
          Jednak jeśli chcesz go wesprzeć i pomóc w rozwoju strony oraz nowych funkcjonalności, które wykraczają poza darmowe możliwości
          hostingu, na którym jest postawiony, zostaw złotówkę, nowigradzką koronę czy nawet rubla!
        </div>

        <div class="modal_payments">
          <div>Płatności dokonasz korzystając z poniższych metod:</div>
          <div class="payment">
            <div>
              <a target="_blank" href="https://paypal.me/spythere">
                <img :src="paypalIcon" alt="icon-paypal" />
                <span>PAYPAL</span>
              </a>
            </div>
          </div>

          <div class="payment">
            <div>
              <div class="payment_open" v-if="showNumber">94 1140 2004 0000 3502 7784 9203</div>
              <div class="payment_closed" v-else @click="showNumber = true">
                <b>PRZELEW NA KONTO</b>
              </div>
            </div>
          </div>
        </div>

        <div>Wielkie dzięki i do zobaczenia na szlaku!</div>

        <div class="modal_buttons">
          <button class="button" @click="toggleModal">PRZYJĄŁEM!</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class Modal extends Vue {
  @Prop() modalHidden!: boolean;

  showNumber = false;
  STORAGE_ID = "modal_donation";

  paypalIcon: string = require("@/assets/icon-paypal.svg");

  toggleModal(type: string) {
    this.$emit("toggleModal");
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";

.modal {
  z-index: 100;

  font-size: calc(1rem + 0.8vw);
  padding: 0.3rem;

  border-radius: 1em;

  position: fixed;
  top: 50%;
  left: 50%;

  width: 65%;
  max-width: 950px;

  transform: translate(-50%, -50%);

  background: rgba(black, 0.85);
  color: white;

  @include bigScreen() {
    font-size: 2rem;
  }

  @include smallScreen() {
    font-size: 1.2rem;
    width: 95%;
  }

  &_content {
    margin: 0 auto;
    text-align: center;

    padding: 0.5em;
  }

  &_title {
    color: gold;
    font-weight: bold;
  }

  &_body {
    font-size: 0.75em;

    &-header {
      text-align: justify;
    }

    > div {
      margin-top: 0.5em;
    }
  }

  &_payments {
    > span {
      margin-right: 0.5em;
    }

    .payment {
      display: flex;
      justify-content: center;

      margin-top: 0.3em;

      &_closed {
        cursor: pointer;

        &:hover {
          color: gold;
        }
      }

      a {
        display: flex;
        justify-content: center;
        align-items: center;

        border-radius: 0.2em;
        padding: 0.15em 0.3em;

        font-size: 1.1em;
        font-weight: bold;
      }

      img {
        width: 1.2em;
        margin-right: 0.2em;
      }
    }
  }

  &_buttons {
    display: flex;
    justify-content: center;

    > button {
      margin: 0 0.5em;
    }
  }
}
</style>