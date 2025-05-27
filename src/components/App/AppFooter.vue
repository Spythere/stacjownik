<template>
  <footer class="app_footer">
    &copy;
    <a href="https://td2.info.pl/profile/?u=20777" target="_blank">Spythere</a>
    {{ new Date().getUTCFullYear() }} |
    <button class="btn--text" @click="openUpdateCard">
      v{{ version }}{{ isOnProductionHost ? '' : 'dev' }}
    </button>

    <br />
    <a href="https://discord.gg/x2mpNN3svk">
      <img src="/images/icon-discord.png" alt="discord logo icon" />&nbsp;<b class="text--discord">
        {{ $t('footer.discord') }}
      </b>
    </a>

    <div style="display: none">&int; ukryta taktyczna całka do programowania w HTMLu</div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  emits: ['openUpdateCard'],
  props: {
    isUpdateCardOpen: {
      type: Boolean,
      required: true
    },
    version: String,
    isOnProductionHost: Boolean
  },

  methods: {
    openUpdateCard() {
      this.$emit('openUpdateCard');
    }
  }
});
</script>
