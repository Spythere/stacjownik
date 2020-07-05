<template>
  <div class="list-filter">
    <div class="filter-content">
      <div class="content-row">
        <div class="content-column">
          <div class="column-title">Dostępność:</div>

          <div class="content-item">
            <input type="checkbox" id="is-default" checked @change="handleChange" />
            <label for="is-default">W paczce z grą</label>
          </div>

          <div class="content-item">
            <input type="checkbox" id="not-default" checked @change="handleChange" />
            <label for="not-default">Poza paczką z grą</label>
          </div>
        </div>

        <div class="content-column">
          <div class="column-title">Sterowanie:</div>

          <div class="content-item">
            <input type="checkbox" id="control-SPK" checked @change="handleChange" />
            <label for="control-SPK">SPK</label>
          </div>

          <div class="content-item">
            <input type="checkbox" id="control-SCS" checked @change="handleChange" />
            <label for="control-SCS">SCS</label>
          </div>

          <div class="content-item">
            <input type="checkbox" id="control-hands" checked @change="handleChange" />
            <label for="control-hands">ręczne</label>
          </div>

          <div class="content-item">
            <input type="checkbox" id="control-levers" checked @change="handleChange" />
            <label for="control-levers">mechaniczne</label>
          </div>
        </div>

        <div class="content-column">
          <div class="column-title">Sygnalizacja:</div>

          <div class="content-item">
            <input type="checkbox" id="signals-modern" checked @change="handleChange" />
            <label for="signals-modern">współczesna</label>
          </div>

          <div class="content-item">
            <input type="checkbox" id="signals-mixed" checked @change="handleChange" />
            <label for="signals-mixed">mieszana</label>
          </div>

          <div class="content-item">
            <input type="checkbox" id="signals-historic" checked @change="handleChange" />
            <label for="signals-historic">kształtowa</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapActions } from "vuex";

export default Vue.extend({
  name: "list-filter",
  data: () => ({}),
  methods: {
    ...mapActions(["addFilter", "removeFilter"]),
    handleChange(e: any) {
      // this.$store.commit(e.target.checked ? "removeFilter" : "addFilter", {
      //   id: e.target.id
      // });

      if (e.target.checked) this.removeFilter(e.target.id);
      else this.addFilter(e.target.id);
    }
  }
});
</script>

<style lang="scss" scoped>
@import "../../styles/responsive";

.list-filter {
  display: flex;

  font-size: calc(0.6rem + 0.4vw);
}

.filter-content {
  background: #333;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  padding: 0.3rem;

  @include smallScreen() {
    width: 100%;
  }
}

.content {
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