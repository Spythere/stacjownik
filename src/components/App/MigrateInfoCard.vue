<template>
  <Card :is-open="isOpen" @toggle-card="toggleCard">
    <div class="body-content">
      <div class="content-top">
        <img src="/images/icon-loading.svg" alt="loading" height="125" />
        <h1>Uwaga!</h1>
      </div>

      <div>
        <p>
          Ze względu na coraz większe zainteresowanie Stacjownikiem oraz innymi aplikacjami mojego
          autorstwa
          <b>
            z dniem 1 stycznia 2026r. Stacjownik zostaje <u>permamentnie przeniesiony</u> na nową
            dedykowaną domenę:
          </b>
        </p>

        <p>
          <a class="new-link" href="https://stacjownik-td2.spythere.eu/"
            >https://stacjownik-td2.spythere.eu/</a
          >
        </p>

        <p>
          Obecna strona nie będzie otrzymywać już przyszłych aktualizacji, a po Nowym Roku będzie
          jedynie przenosić na powyższy adres.
        </p>

        <p class="info-bottom">
          <i>"Po co psujesz? Przecież było dobrze tyle czasu!"</i>
          <br />
          Zmiana podyktowana jest głównie wzrostem zainteresowania stroną i przekraczaniem darmowego
          limitu obecnego hostingu Google'a, który wymusza płatność za każde użycie serwisu ponad
          określoną wartość (lub w przeciwnym wypadku blokuje do niego dostęp). Przenosząc stronę na
          dedykowaną domenę (która jest już wykupiona i utrzymywana dzięki pomocy
          <span class="text--donator">Wspierających</span>), pozbędę się niepotrzebnego wydatku dla
          wielkiej korporacji, która w każdej chwili może mi wyłączyć aplikację.
        </p>
      </div>

      <div class="content-actions">
        <button class="btn btn--action" @click="toggleCard">PRZYJĄŁEM!</button>
      </div>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import Card from '../Global/Card.vue';

defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['toggleCard']);

function toggleCard() {
  emit('toggleCard');
}
</script>

<style lang="scss" scoped>
.body-content {
  max-width: 800px;
  min-height: 300px;
  padding: 1em 0.5em;

  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.5em;

  text-align: center;
  font-size: 1.1em;
}

p {
  padding: 0.5em 0;
}

a.new-link {
  font-size: 1.2em;
  color: var(--clr-primary);
  color: transparent;

  background: var(--clr-primary);
  background: linear-gradient(90deg, var(--clr-primary), #ffffff);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  text-shadow: var(--clr-primary) 0 0 10px;
}

.info-bottom {
  font-size: 0.9em;
  color: #ccc;
}

.content-actions {
  display: flex;
  justify-content: center;
  font-size: 1.2em;
}
</style>
