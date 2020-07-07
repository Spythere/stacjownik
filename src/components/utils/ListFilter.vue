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
                  type="number"
                  name="level-from"
                  min="0"
                  max="25"
                  value="0"
                  @change="handleInput"
                />
                <span>&nbsp;do&nbsp;</span>
                <input
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
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { mapActions } from "vuex";

export default Vue.extend({
  name: "list-filter",
  data: () => ({
    gridElements: {
      access: {
        title: "Dostępność",
        type: "checkbox",
        items: [
          {
            id: "is-default",
            name: "default",
            content: "w paczce z grą"
          },
          {
            id: "not-default",
            name: "notDefault",
            content: "poza paczką z grą"
          },
          {
            id: "non-public",
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
            name: "SPK",
            content: "SPK"
          },
          {
            id: "SCS",
            name: "SCS",
            content: "SCS"
          },
          {
            id: "by-hand",
            name: "ręczne",
            content: "ręczne"
          },
          {
            id: "levers",
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
            name: "współczesna",
            content: "współczesna"
          },
          {
            id: "semaphore",
            name: "kształtowa",
            content: "kształtowa"
          },
          {
            id: "mixed",
            name: "mieszana",
            content: "mieszana"
          },
          {
            id: "historic",
            name: "historyczna",
            content: "historyczna"
          }
        ]
      }
    }
  }),
  methods: {
    ...mapActions(["setFilter"]),
    handleChange(e: any) {
      this.setFilter({ filterName: e.target.name, value: !e.target.checked });
    },
    handleInput(e: any) {
      this.setFilter({
        filterName: e.target.name,
        value: parseInt(e.target.value)
      });
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

.item-title {
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: bold;

  color: $accentCol;
}
</style>