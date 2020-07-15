<template>
  <section class="legend-card">
    <div class="card-exit" @click="exit">
      <img :src="require('@/assets/icon-exit.svg')" alt="exit icon" />
    </div>

    <div class="card-title flex">LEGENDA</div>

    <div class="card-icons">
      <div class="legend-icon" v-for="(icon, i) in icons" :key="i">
        <img :src="require(`@/assets/icon-${icon.name}.svg`)" :alt="icon.name" />
        <span>{{icon.desc}}</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class LegendCard extends Vue {
  @Prop() exit!: void;

  icons: { name: string; desc: string }[] = [
    { name: "SPK", desc: "Sceneria sterowana za pomocą programu SPK" },
    { name: "SCS", desc: "Sceneria sterowana za pomocą programu SCS" },
    {
      name: "SCS-SPK",
      desc: "Sceneria sterowana za pomocą programu SCS lub SPK"
    },
    {
      name: "mechaniczne",
      desc: "Sceneria posiadająca urządzenia sterowane mechanicznie"
    },
    {
      name: "mechaniczne+SPK",
      desc:
        "Sceneria posiadająca urządzenia sterowane mechanicznie zintegrowane z SPK"
    },
    {
      name: "mechaniczne+SCS",
      desc:
        "Sceneria posiadająca urządzenia sterowane mechanicznie zintegrowane z SCS"
    },
    { name: "ręczne", desc: "Sceneria z ręcznie sterowanymi zwrotnicami" },
    {
      name: "ręczne+SPK",
      desc: "Sceneria z ręcznie sterowanymi zwrotnicami zintegrowana z SPK"
    },
    {
      name: "współczesna",
      desc: "Sceneria ze współczesną sygnalizacją świetlną"
    },
    { name: "kształtowa", desc: "Sceneria ze sygnalizacją kształtową" },
    { name: "historyczna", desc: "Sceneria ze sygnalizacją historyczną" },
    {
      name: "mieszana",
      desc:
        "Sceneria ze sygnalizacją mieszaną (kształtowe, historyczne lub/i współczesne)"
    }
  ];
}
</script>

<style lang="scss">
@import "../../styles/variables.scss";
@import "../../styles/responsive.scss";

.legend-card {
  display: flex;
  flex-direction: column;

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;

  overflow: auto;
  background: #262a2e;

  box-shadow: 0 0 15px 5px #474747;

  width: 65%;
  max-width: 650px;
  max-height: 95%;

  font-size: calc(0.6rem + 0.5vw);

  @include smallScreen {
    width: 85%;
  }
}

.card {
  &-exit {
    position: absolute;
    top: 0;
    right: 0;

    margin: 0.8em;

    img {
      width: 1.1em;
    }

    cursor: pointer;
  }

  &-title {
    font-size: 2em;
    font-weight: 700;
    color: $accentCol;

    margin: 0.5em 0;
  }

  &-icons {
  }
}

.legend-icon {
  display: flex;
  align-items: center;

  padding: 0.5em;

  img {
    width: 2em;
    margin-right: 0.5em;
  }

  span {
    font-size: 0.9em;
  }
}
</style>