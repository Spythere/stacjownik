<template>
  <Card :is-open="isOpen" @toggle-card="toggleCard">
    <div class="body-content">
      <div class="content-top">
        <img src="/images/icon-loading.svg" alt="loading" height="125" />
        <h1>{{ t('migrate-info.header-text') }}</h1>
      </div>

      <div>
        <p v-html="t('migrate-info.paragraph-1-html')"></p>

        <p>
          <a class="new-link" href="https://stacjownik-td2.spythere.eu/" target="_blank">
            {{ t('migrate-info.paragraph-2-link-text') }}
          </a>
        </p>

        <p>
          {{ t('migrate-info.paragraph-3-text') }}
        </p>

        <p class="info-bottom" v-html="t('migrate-info.paragraph-4-html')"></p>
      </div>

      <div class="content-actions">
        <button class="btn btn--action" @click="toggleCard">PRZYJĄŁEM!</button>
      </div>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import Card from '../Global/Card.vue';

const { t } = useI18n();

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
  min-height: 500px;
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
