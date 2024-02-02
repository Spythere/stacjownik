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

          <g v-if="indicator.lights.greenLight" filter="url(#filter0_d_843_28)">
            <circle cx="15" cy="17" r="7" fill="#00FF0A" />
          </g>

          <g v-if="indicator.lights.greenBlinkLight" filter="url(#filter0_d_843_28)">
            <circle cx="15" cy="17" r="7" fill="#00FF0A" />

            <animate
              attributeType="XML"
              attributeName="opacity"
              values="1;0;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </g>

          <g v-if="indicator.lights.redTopLight" filter="url(#filter1_d_843_28)">
            <circle cx="15" cy="36" r="7" fill="#F40000" />
          </g>

          <g v-if="indicator.lights.orangeLight" filter="url(#filter2_d_843_28)">
            <circle cx="15" cy="55" r="7" fill="#FFB800" />
          </g>
          <g v-if="indicator.lights.redBottomLight" filter="url(#filter3_d_843_28)">
            <circle cx="15" cy="74" r="7" fill="#F40000" />

            <animate
              attributeType="XML"
              attributeName="opacity"
              values="1;0;1"
              dur="1s"
              repeatCount="indefinite"
            />
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
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_843_28"
              result="shape"
            />
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
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_843_28"
              result="shape"
            />
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
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_843_28"
              result="shape"
            />
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
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_843_28"
              result="shape"
            />
          </filter>
        </defs>
      </svg>

      <transition name="tooltip-anim">
        <div
          v-html="$t('data-status.' + indicator.message)"
          class="indicator-tooltip"
          v-if="tooltipActive"
        ></div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Status } from '../../typings/common';
import { useApiStore } from '../../store/apiStore';
import { APIDataStatus } from '../../typings/api';

interface Indicator {
  // status: Status.Data;
  message: string;

  lights: {
    greenLight: boolean;
    greenBlinkLight: boolean;
    redTopLight: boolean;
    orangeLight: boolean;
    redBottomLight: boolean;
  };
}

export default defineComponent({
  data() {
    return {
      tooltipActive: false,
      apiStore: useApiStore()
    };
  },

  methods: {
    setLights(message: string) {
      let lights = {
        greenBlinkLight: false,
        greenLight: false,
        orangeLight: false,
        redBottomLight: false,
        redTopLight: false
      };

      switch (message) {
        case 'S3':
          lights.greenBlinkLight = true;
          break;

        case 'S2':
          lights.greenLight = true;
          break;

        case 'S1-offline':
          lights.redTopLight = true;
          break;

        case 'S1a-connection':
        case 'S1a-sceneries':
          lights.redTopLight = true;
          lights.redBottomLight = true;
          break;

        case 'S5-dispatchers':
        case 'S5-trains':
          lights.orangeLight = true;
          break;
        default:
          break;
      }

      return lights;
    }
  },

  computed: {
    indicator(): Indicator {
      const dataStatuses = this.apiStore.dataStatuses;
      const swdrStatuses = this.apiStore.activeData?.apiStatuses;

      let message = 'S3';

      switch (dataStatuses.connection) {
        case Status.Data.Loading:
          message = 'S3';
          break;
        case Status.Data.Loaded:
          message = 'S2';
          break;
        case Status.Data.Offline:
          message = 'S1-offline';
          break;
        case Status.Data.Error:
          message = 'S1a-connection';
          break;
        default:
          break;
      }

      if (swdrStatuses?.dispatchersAPI == APIDataStatus.WARNING) {
        message = 'S5-dispatchers';
      }

      if (swdrStatuses?.trainsAPI == APIDataStatus.WARNING) {
        message = 'S5-trains';
      }

      if (swdrStatuses?.stationsAPI == APIDataStatus.WARNING) {
        message = 'S1a-sceneries';
      }

      return {
        lights: this.setLights(message),
        message
      };
    }
  }
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
  bottom: 0;
  right: 0;
  z-index: 100;

  transform: translateX(1.5em);
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

    width: 13em;
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
      left: auto;
      right: 200%;

      &::before {
        border-right: 10px solid transparent;
        border-left: 12px solid #171717;
        right: 0;
        left: auto;

        transform: translate(100%, -50%);
      }
    }

    @include smallScreen() {
      min-width: 8em;
    }
  }
}
</style>
