<template>
  <div class="filter-option option">
    <label class="option-label">
      <input
        class="option-input"
        type="checkbox"
        :name="option.name"
        :defaultValue="option.defaultValue"
        :id="option.id"
        v-model="option.value"
        @change="handleChange"
      />
      <span
        class="option-content"
        :class="option.section + (option.value ? ' checked' : '')"
        >{{ $t(`filters.${option.id}`) }}
      </span>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface FilterOption {
  id: string;
  name: string;
  section: string;
  value: boolean;
  defaultValue: boolean;
}

export default defineComponent({
  props: {
    option: {
      type: Object as () => FilterOption,
      required: true,
    },
  },
  emits: ["optionChange"],
  methods: {
    handleChange() {
      this.$emit("optionChange", {
        name: this.option.name,
        value: this.option.value,
      });
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
$accessCol: #e03b07;
$controlCol: #0085ff;
$signalCol: #bf7c00;
$statusCol: #349b32;
$saveCol: #28a826;
$routesCol: #9049c0;

.option {
  input {
    display: none;
  }

  span {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    width: 100%;
    text-align: center;

    cursor: pointer;

    padding: 0.5em 0.55em;

    display: inline-block;
    position: relative;

    transition: all 0.2s;

    border-radius: 0.5em;

    &:not(.checked) {
      background-color: #585858;

      &::before {
        box-shadow: none;
      }
    }

    &.checked {
      &.access {
        background-color: $accessCol;

        &::before {
          box-shadow: 0 0 6px 1px $accessCol;
        }
      }

      &.control {
        background-color: $controlCol;

        &::before {
          box-shadow: 0 0 6px 1px $controlCol;
        }
      }

      &.signals {
        background-color: $signalCol;

        &::before {
          box-shadow: 0 0 6px 1px $signalCol;
        }
      }

      &.routes {
        background-color: $routesCol;

        &::before {
          box-shadow: 0 0 6px 1px $routesCol;
        }
      }

      &.status {
        background-color: $statusCol;

        &::before {
          box-shadow: 0 0 6px 1px $statusCol;
        }
      }

      &.save {
        background-color: $saveCol;

        &::before {
          box-shadow: 0 0 6px 1px $saveCol;
        }
      }

      &.mode {
        background-color: lightgreen;
        color: black;

        font-weight: 500;
      }

      &::before {
        position: absolute;
        content: "";
        top: 0;
        left: 0;

        width: 100%;
        height: 100%;

        border-radius: 0.5em;
      }
    }
  }
}
</style>