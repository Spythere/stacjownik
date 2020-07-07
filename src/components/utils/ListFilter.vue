<template>
  <div class="list-filter">
    <ul class="grid">
      <li class="grid-row">
        <div class="grid-col" v-for="(el, i) in gridElements" :key="i">
          <div class="grid-item">
            <div class="item-title">{{el.title}}</div>

            <div class="item-content">
              <div class="item-input" v-for="(item, i) in el.items" :key="i">
                <input
                  :type="el.type"
                  :id="item.id"
                  :name="item.name"
                  v-model="item.value"
                  checked
                  @change="handleChange"
                />
                <label :for="item.id">{{ item.content }}</label>
              </div>
            </div>
          </div>
        </div>
      </li>

      <li class="grid-row">
        <div class="grid-col">
          <div class="grid-item">
            <div class="item-title">Poziomy dyżurnego</div>

            <div class="item-content centered">
              <div class="item-input" style="text-align: center;">
                <input
                  v-model="levelFrom"
                  type="number"
                  name="level-from"
                  min="0"
                  max="25"
                  @change="handleInput"
                />
                <span>&nbsp;do&nbsp;</span>
                <input
                  v-model="levelTo"
                  type="number"
                  name="level-to"
                  min="0"
                  max="20"
                  value="20"
                  @change="handleInput"
                />
              </div>
            </div>
          </div>
        </div>
      </li>

      <li class="grid-row">
        <div class="grid-col">
          <div class="grid-item">
            <div class="item-title">
              Szlaki jednotorowe
              <div>(minimum)</div>
            </div>

            <div class="item-content">
              <div class="item-input">
                <input
                  v-model="oneWay"
                  type="checkbox"
                  id="no-1track"
                  name="no-1track"
                  checked
                  @change="handleChange"
                />
                <label for="no-1track">Jednotory</label>
              </div>

              <div class="item-input">
                <input
                  v-model="oneWayCatenary"
                  type="number"
                  name="1track-e"
                  min="0"
                  max="5"
                  placeholder="0"
                  @change="handleInput"
                />
                <span>&nbsp;Zelektryfikowane</span>
              </div>

              <div class="item-input">
                <input
                  v-model="oneWayOther"
                  type="number"
                  name="1track-ne"
                  min="0"
                  max="5"
                  placeholder="0"
                  @change="handleInput"
                />
                <span>&nbsp;Niezelektryfikowane</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid-col">
          <div class="grid-item">
            <div class="item-title">
              Szlaki dwutorowe
              <div>(minimum)</div>
            </div>

            <div class="item-content">
              <div class="item-input">
                <input
                  v-model="twoWay"
                  type="checkbox"
                  id="no-2track"
                  name="no-2track"
                  ref="2track"
                  checked
                  @change="handleChange"
                />
                <label for="no-2track">Dwutory</label>
              </div>

              <div class="item-input">
                <input
                  v-model="twoWayCatenary"
                  type="number"
                  name="2track-e"
                  min="0"
                  max="5"
                  placeholder="0"
                  @change="handleInput"
                />
                <span>&nbsp;Zelektryfikowane</span>
              </div>

              <div class="item-input">
                <input
                  v-model="twoWayOther"
                  type="number"
                  name="2track-ne"
                  min="0"
                  max="5"
                  placeholder="0"
                  @change="handleInput"
                />
                <span>&nbsp;Niezelektryfikowane</span>
              </div>
            </div>
          </div>
        </div>
      </li>

      <li class="grid-row">
        <button @click="reset">RESET FILTRÓW</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { mapActions } from "vuex";

export default Vue.extend({
  name: "list-filter",
  watch: {
    gridElements: {
      handler: (v1, v2) => {},
      deep: true
    }
  },
  data: () => ({
    oneWay: true,
    twoWay: true,
    levelFrom: 0,
    levelTo: 20,
    oneWayCatenary: 0,
    oneWayOther: 0,
    twoWayCatenary: 0,
    twoWayOther: 0,

    gridElements: {
      access: {
        title: "Dostępność",
        type: "checkbox",
        items: [
          {
            id: "is-default",
            value: true,
            name: "default",
            content: "w paczce z grą"
          },
          {
            id: "not-default",
            value: true,
            name: "notDefault",
            content: "poza paczką z grą"
          },
          {
            id: "non-public",
            value: true,
            name: "nonPublic",
            content: "niepubliczna"
          }
        ]
      },

      control: {
        title: "Sterowanie",
        type: "checkbox",

        items: [
          {
            id: "SPK",
            value: true,
            name: "SPK",
            content: "SPK"
          },
          {
            id: "SCS",
            value: true,
            name: "SCS",
            content: "SCS"
          },
          {
            id: "by-hand",
            value: true,
            name: "ręczne",
            content: "ręczne"
          },
          {
            id: "levers",
            value: true,
            name: "mechaniczne",
            content: "mechaniczne"
          }
        ]
      },

      signals: {
        title: "Sygnalizacja",
        type: "checkbox",

        items: [
          {
            id: "modern",
            value: true,
            name: "współczesna",
            content: "współczesna"
          },
          {
            id: "semaphore",
            value: true,
            name: "kształtowa",
            content: "kształtowa"
          },
          {
            id: "mixed",
            value: true,
            name: "mieszana",
            content: "mieszana"
          },
          {
            id: "historic",
            value: true,
            name: "historyczna",
            content: "historyczna"
          }
        ]
      }
    }
  }),
  methods: {
    ...mapActions(["setFilter", "resetFilters"]),
    handleChange(e: any) {
      this.setFilter({ filterName: e.target.name, value: !e.target.checked });
    },
    handleInput(e: any) {
      this.setFilter({
        filterName: e.target.name,
        value: parseInt(e.target.value)
      });
    },
    reset() {
      for (const [key, value] of Object.entries(this.gridElements)) {
        for (const item of this.gridElements[key].items) {
          item.value = true;
        }
      }

      this.oneWay = true;
      this.twoWay = true;
      this.levelFrom = 0;
      this.levelTo = 20;
      this.oneWayCatenary = 0;
      this.oneWayOther = 0;
      this.twoWayCatenary = 0;
      this.twoWayOther = 0;

      this.resetFilters();
    }
  }
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";
@import "../../styles/variables";

.list-filter {
  position: absolute;
  top: 100%;
  left: 0;
  padding: 0.3rem;

  @include smallScreen() {
    width: 100vw;
  }

  white-space: nowrap;

  font-size: calc(0.6rem + 0.4vw);

  @include smallScreen() {
    font-size: 0.65rem;
  }
}

.grid {
  background: rgba(black, 0.65);
  padding: 0.5rem;

  &-row {
    display: flex;
    justify-content: center;

    @include smallScreen() {
      flex-wrap: wrap;
    }
  }

  &-col {
    padding: 0.3rem;
  }

  &-item {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
  }
}
.item {
  &-title {
    text-align: center;
    margin-bottom: 0.5rem;
    font-weight: bold;

    color: $accentCol;
  }
}
</style>