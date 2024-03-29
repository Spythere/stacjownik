<template>
  <AnimatedModal :is-open="mainStore.isNewUpdate" @toggle-modal="toggleModal">
    <div class="modal_content">
      <div>
        <h1 style="margin-bottom: 0.5em">{{ $t('update.title') }}</h1>
        <h2 class="text--primary">{{ $t('update.version', [version]) }}</h2>
        <hr class="separator" />
      </div>

      <div class="features-list">
        <h2>Nowości i zmiany:</h2>
        <ul>
          <li v-for="content in localeChangesArray" :key="content">{{ content }}</li>
        </ul>
      </div>

      <div class="modal_actions">
        <button class="btn--action">Przyjąłem!</button>

        <p>Ten changelog będzie zawsze dostępny po kliknięciu numeru wersji w stopce strony!</p>

        <!-- <div class="actions-checkboxes">
          <label>
            <input type="checkbox" />
            <span>nie pokazuj dla przyszłych aktualizacji</span>
          </label>

          <label>
            <input type="checkbox" />
            <span>nie pokazuj dla przyszłych aktualizacji</span>
          </label>
        </div> -->
      </div>
    </div>
  </AnimatedModal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from '../../store/mainStore';
import { version } from '../../../package.json';
import AnimatedModal from '../Global/AnimatedModal.vue';

export default defineComponent({
  components: { AnimatedModal },

  data() {
    return {
      mainStore: useMainStore(),
      version: version
    };
  },

  computed: {
    localeChangesArray() {
      return this.$t('update.content').split('\n');
    }
  },

  methods: {
    toggleModal(value: boolean) {
      this.$emit('toggleModal', value);
    }
  }
});
</script>

<style lang="scss" scoped>
.modal_content {
  font-size: 1.2em;
  text-align: center;
  padding: 1em;
  height: 80vh;
  min-height: 550px;

  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.5em;
}

hr.separator {
  margin: 0.5em 0;
  padding: 0;
  height: 3px;
  background-color: #fff;
}

.features-list {
  margin-top: 0.5em;
  overflow: auto;

  ul {
    text-align: left;
    list-style: '\21D2  ';
    padding: 1em;
  }

  li {
    margin: 0.5em 0;
  }
}

.modal_actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;

  button {
    font-weight: bold;
    padding: 0.35em;
  }

  p {
    font-size: 0.9em;
  }
}

.actions-checkboxes {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  gap: 1em;

  label {
    font-size: 0.9em;
  }

  label > input {
    margin-right: 0.5em;
  }
}
</style>
