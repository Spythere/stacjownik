<template>
  <div class="status-indicator">
    <div class="indicator-content">
      <svg
        width="31"
        viewBox="0 0 31 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="indicator-svg"
        @mouseenter="() => (tooltipActive = true)"
        @mouseleave="() => (tooltipActive = false)"
      >
        <g id="status-signal-icon">
          <path
            id="Vector 26"
            d="M4.5 83V99L14 110.5"
            stroke="#171616"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            id="Vector 27"
            d="M18.5 89.5L27.5 89.5L27.5 81.5"
            stroke="#171616"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <rect id="Rectangle 13" x="11" y="83" width="8" height="49" fill="#CACACA" />
          <rect id="Rectangle 12" width="31" height="90" rx="15.5" fill="#171616" />
          <rect id="Rectangle 25" x="7" y="88" width="16" height="9.6" fill="white" />
          <g id="Group 46">
            <circle id="Ellipse 13" cx="15" cy="74" r="7" fill="#393838" />
            <circle id="Ellipse 16" cx="15" cy="55" r="7" fill="#393838" />
            <circle id="Ellipse 17" cx="15" cy="36" r="7" fill="#393838" />
            <circle id="Ellipse 18" cx="15" cy="17" r="7" fill="#393838" />
          </g>

          <g v-if="greenLight" filter="url(#filter0_d_843_28)">
            <circle cx="15" cy="17" r="7" fill="#00FF0A" />
          </g>

          <g v-if="greenBlinkLight" filter="url(#filter0_d_843_28)">
            <circle cx="15" cy="17" r="7" fill="#00FF0A" />

            <animate attributeType="XML" attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
          </g>

          <g v-if="redTopLight" filter="url(#filter1_d_843_28)">
            <circle cx="15" cy="36" r="7" fill="#F40000" />
          </g>

          <g v-if="orangeLight" filter="url(#filter2_d_843_28)">
            <circle cx="15" cy="55" r="7" fill="#FFB800" />
          </g>
          <g v-if="redBottomLight" filter="url(#filter3_d_843_28)">
            <circle cx="15" cy="74" r="7" fill="#F40000" />

            <animate attributeType="XML" attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
          </g>
        </g>

        <defs>
          <filter
            id="filter0_d_843_28"
            x="3"
            y="5"
            width="24"
            height="24"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="2.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 1 0 0 0 0 0.04 0 0 0 1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_843_28" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_843_28" result="shape" />
          </filter>
          <filter
            id="filter1_d_843_28"
            x="3"
            y="24"
            width="24"
            height="24"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="2.5" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.770833 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_843_28" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_843_28" result="shape" />
          </filter>
          <filter
            id="filter2_d_843_28"
            x="3"
            y="43"
            width="24"
            height="24"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="2.5" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.72 0 0 0 0 0 0 0 0 1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_843_28" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_843_28" result="shape" />
          </filter>
          <filter
            id="filter3_d_843_28"
            x="3"
            y="62"
            width="24"
            height="24"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="2.5" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.770833 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_843_28" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_843_28" result="shape" />
          </filter>
        </defs>
      </svg>

      <transition name="tooltip-anim">
        <div v-html="$t(indicator.message)" class="indicator-tooltip" v-if="tooltipActive"></div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import { DataStatus } from '../../scripts/enums/DataStatus';
import { useStore } from '../../store/store';
import { StoreState } from '../../store/storeTypes';

export default defineComponent({
  data() {
    return {
      tooltipActive: false,
      indicator: {
        status: DataStatus.Loading,
        message: 'data-status.S3',
      },

      greenLight: false,
      greenBlinkLight: false,
      redTopLight: false,
      orangeLight: false,
      redBottomLight: false,
    };
  },

  mounted() {
    this.setSignalStatus(DataStatus.Loading);
  },

  setup() {
    const store = useStore();

    return {
      dataStatus: store.dataStatuses,
    };
  },

  watch: {
    dataStatus: {
      deep: true,

      handler(statuses: StoreState['dataStatuses']) {
        const connectionStatus = statuses.connection;
        const sceneryDataStatus = statuses.sceneries;
        const trainsDataStatus = statuses.trains;
        const dispatcherDataStatus = statuses.dispatchers;

        if (connectionStatus == DataStatus.Error) {
          this.setSignalStatus(connectionStatus);
          this.indicator.status = connectionStatus;
          this.indicator.message = 'data-status.S1a-connection';
          return;
        }

        if (sceneryDataStatus == DataStatus.Error) {
          this.setSignalStatus(sceneryDataStatus);
          this.indicator.status = sceneryDataStatus;
          this.indicator.message = 'data-status.S1a-sceneries';
          return;
        }

        if (trainsDataStatus == DataStatus.Warning) {
          this.setSignalStatus(trainsDataStatus);
          this.indicator.status = trainsDataStatus;
          this.indicator.message = 'data-status.S5-trains';
          return;
        }

        if (dispatcherDataStatus == DataStatus.Warning) {
          this.setSignalStatus(dispatcherDataStatus);
          this.indicator.status = dispatcherDataStatus;
          this.indicator.message = 'data-status.S5-dispatchers';
          return;
        }

        if (sceneryDataStatus == DataStatus.Loaded) {
          this.setSignalStatus(DataStatus.Loaded);

          this.indicator.status = DataStatus.Loaded;
          this.indicator.message = 'data-status.S2';
        }
      },
    },
  },

  methods: {
    setSignalStatus(status: DataStatus) {
      this.greenLight = false;
      this.greenBlinkLight = false;
      this.redTopLight = false;
      this.orangeLight = false;
      this.redBottomLight = false;

      if (status == DataStatus.Loaded) {
        this.greenLight = true;
      }

      if (status == DataStatus.Warning) {
        this.orangeLight = true;
      }

      if (status == DataStatus.Error) {
        this.redTopLight = true;
        this.redBottomLight = true;
      }

      if (status == DataStatus.Loading) {
        this.greenBlinkLight = true;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';

// INDICATOR TOOLTIP ANIMATION
.tooltip-anim {
  &-enter-from,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active,
  &-leave-active {
    transition: all 100ms ease-in-out;
  }
}

.status-indicator {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(12em);
  z-index: 100;
}

.indicator {
  &-content {
    display: flex;
    position: relative;
  }

  &-svg {
    width: 1.2em;
  }

  &-tooltip {
    position: absolute;
    top: 50%;
    left: 100%;

    transform: translateY(-50%);
    padding: 0.5em;
    margin-left: 1em;

    background-color: #171717;
    border-radius: 0.75em;

    min-width: 13em;
    text-align: center;
    overflow: none;

    font-size: 0.95em;

    &::before {
      position: absolute;
      top: 50%;
      left: 1px;

      transform: translate(-100%, -50%);

      width: 0;
      height: 0;

      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-right: 12px solid #171717;

      content: '';
    }

    @include midScreen() {
      left: 50%;
      top: 100%;

      transform: translate(-50%, 0);
      margin-left: 0;
      margin-top: 0.75em;

      &::before {
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 10px solid #171717;

        top: 0;
        left: 50%;

        transform: translate(-50%, -100%);
      }
    }

    @include smallScreen() {
      min-width: 8em;
    }
  }
}
</style>
