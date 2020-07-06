<template>
  <div class="list-filter">
    <div class="filter-grid">
      <div class="grid-row">
        <div class="grid-column" v-for="(el, i) in gridElements" :key="i">
          <div class="column-title">{{el.title}}</div>

          <div class="column-content">
            <div class="grid-item" v-for="(item, i) in el.items" :key="i">
              <input :type="el.type" :id="item.id" :name="item.name" checked @change="handleChange" />
              <label :for="item.id">{{ item.content }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    ...mapActions(["addFilters", "removeFilters"]),
    handleChange(e: any) {
      if (e.target.checked) {
        this.removeFilters([e.target.name]);
      } else this.addFilters([e.target.name]);
    }
  }
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";

.list-filter {
  display: flex;

  font-size: calc(0.6rem + 0.4vw);

  @include smallScreen() {
    width: 100%;
  }
}

.filter-grid {
  background: #333;
  border-radius: 0 1rem 1rem 1rem;
  padding: 0.3rem;
}

.grid {
  &-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  &-column {
    margin: 0.3rem;
    padding: 0.2rem;
  }
}

.column-title {
  text-align: center;
  margin-bottom: 0.3rem;
  font-weight: bold;
}
</style>