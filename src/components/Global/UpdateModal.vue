<template>
  <div class="modal">
    <div class="header">
      <span>Stacj</span>
      <img src="@/assets/trainlogo.png" alt="trainlogo" />
      <span>wnik</span>
      <sup style="font-size: 0.5em; margin-left: 10px;" class="title">1.4</sup>
    </div>

    <div class="title">Dziennik Aktywności Scenerii dostępny w wersji beta!</div>

    <div class="content">
      Do użytku został oddany Dziennik Aktywności Scenerii, który pozwala na dostęp do informacji kto i kiedy dyżurował na danej stacji.
      Aby przejść do zakładki z dziennikiem wystarczy wybrać opcję "DZIENNIK" w menu na górze strony. Funkcjonalność ta jest nadal w trakcie prac,
      więc informacje, które pokazuje, mogą być niepoprawne, a dane kasowane w ramach dalszych testów.
      <div style="text-align: center; font-weight: bold; margin: 0.5em 0;">Miłego korzystania!</div>
    </div>

    <button class="button" @click="toggleUpdateModal">PRZYJĄŁEM!</button>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class UpdateModal extends Vue {
  @Prop() currentVersion!: string;

  STORAGE_ID = "modal_update";

  toggleUpdateModal(type: string) {
    this.$emit("toggleUpdateModal");
  }
}
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";

.modal {
  z-index: 100;

  padding: 1em;

  border-radius: 1em;

  position: fixed;
  top: 50%;
  left: 50%;

  width: 65%;
  max-width: 950px;

  max-height: 95vh;
  overflow: auto;

  transform: translate(-50%, -50%);

  background: rgba(black, 0.85);
  color: white;

  text-align: center;

  @include smallScreen() {
    font-size: 0.8em;
    width: 95%;
  }
}

.header {
  font-size: 4.5em;

  img {
    width: 0.8em;
  }
}

.title {
  font-size: 2em;
}

.content {
  font-size: 1.4em;

  text-align: justify;

  ul {
    list-style: square inside;
  }
}

.button {
  font-size: 1.25em;
  margin: 0 auto;
}
</style>