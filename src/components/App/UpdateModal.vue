<template>
  <section>
    <!-- <h2>Ostatnie aktualizacje w Stacjowniku</h2>
    <p>Tutaj będą pojawiać się informacje o kolejnych nowościach na stronie :)</p>

    <ul>
      <li v-for="update in updates">
        <div>{{ update.date }}</div>

        <div>
          <span v-for="(line, l) in update.content" :key="l">{{ line }}</span>
        </div>
      </li>
    </ul> -->

  </section>
</template>

<script lang="ts">
import { ReleaseAPIData } from '@/scripts/interfaces/github_api/ReleaseAPIData';
import { defineComponent } from '@vue/runtime-core';
import packageInfo from '../../../package.json';
import axios from 'axios';

const GH_LASTEST_RELEASE_URL = 'https://api.github.com/repos/Spythere/stacjownik/releases/latest';

export default defineComponent({
  mounted() {
    this.fetchReleases();
  },

  data() {
    return {
      cardOpen: false,

      updateBody: '',
    };
  },

  methods: {
    async fetchReleases() {
      try {
        const releaseData: ReleaseAPIData = await (await axios.get(GH_LASTEST_RELEASE_URL)).data;
        if(!releaseData) return;

        const tagVersion = releaseData.tag_name.slice(1);

        console.log(packageInfo.version == tagVersion);

        this.updateBody = releaseData.body;
      } catch (error) {
        console.error(`Wystąpił błąd podczas pobierania danych z API GitHuba: ${error}`);
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
