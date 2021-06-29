<template>
  <section
    class="updates card"
    v-if="cardOpen"
  >
    <h2>Ostatnie aktualizacje w Stacjowniku</h2>
    <p>Tutaj będą pojawiać się informacje o kolejnych nowościach na stronie :)</p>

    <ul>
      <li
        v-for="(update, i) in updates"
        :key="i"
      >
        <div>{{update.date}}</div>

        <div>
          <span
            v-for="(line, l) in content"
            :key="l"
          >{{line}}</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  data() {
    return {
      updates: {
        date: "08/08/20",
        content: [
          "Lekko odświeżono wygląd strony, dodano nowy widok z pociągami online",
          "Dodano animacje zmieniania widoków (zakładek)",
          "Dodano przycisk zamykający kartę z filtrami",
        ],
      },
    };
  },
});
</script>

<style lang="scss" scoped>
</style>