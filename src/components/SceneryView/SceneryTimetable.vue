<template>
  <section class="scenery-timetable">
    <div class="timetable-header">
      <h3>
        <img src="/images/icon-timetable.svg" alt="icon-timetable" />
        <span>{{ $t('scenery.timetables') }}</span>

        <span>
          <span class="text--primary">{{ onlineScenery?.scheduledTrainCount.all || 0 }}</span>
          <span> / </span>
          <span class="text--grayed">
            {{ onlineScenery?.scheduledTrainCount.confirmed || '0' }}
          </span>
        </span>

        <span class="header_links">
          <a
            :href="`https://pragotron-td2.web.app/board?name=${station.name}`"
            target="_blank"
            :title="$t('scenery.pragotron-link')"
          >
            <img src="/images/icon-pragotron.svg" alt="icon-pragotron" />
          </a>

          <a :href="tabliceZbiorczeHref" target="_blank" :title="$t('scenery.tablice-link')">
            <img src="/images/icon-tablice.ico" alt="icon-tablice" />
          </a>
        </span>
      </h3>

      <div class="timetable-checkpoints" v-if="station?.generalInfo?.checkpoints">
        <span v-for="(cp, i) in station.generalInfo.checkpoints" :key="i">
          {{ (i > 0 && '&bull;') || '' }}

          <button
            :key="cp.checkpointName"
            class="checkpoint_item"
            :class="{ current: chosenCheckpoint === cp.checkpointName }"
            @click="setCheckpoint(cp)"
          >
            {{ cp.checkpointName }}
          </button>
        </span>
      </div>
    </div>

    <div class="timetable-list">
      <transition-group name="list-anim">
        <div
          style="padding-bottom: 5em"
          v-if="store.dataStatuses.trains == 0 && computedScheduledTrains.length == 0"
          key="list-loading"
        >
          <Loading />
        </div>

        <span
          class="timetable-item empty"
          v-else-if="computedScheduledTrains.length == 0 && !onlineScenery"
          key="list-offline"
        >
          {{ $t('scenery.offline') }}
        </span>

        <div
          class="timetable-item empty"
          v-else-if="computedScheduledTrains.length == 0"
          key="list-no-timetables"
        >
          {{ $t('scenery.no-timetables') }}
        </div>

        <div
          class="timetable-item"
          v-else
          v-for="scheduledTrain in computedScheduledTrains"
          :key="scheduledTrain.trainId"
          tabindex="0"
          @click.prevent.stop="selectModalTrain(scheduledTrain.trainId, $event.currentTarget)"
          @keydown.enter.prevent="selectModalTrain(scheduledTrain.trainId, $event.currentTarget)"
        >
          <span class="timetable-general">
            <span class="general-info">
              <span class="info-number">
                <strong>{{ scheduledTrain.category }}</strong>
                {{ scheduledTrain.trainNo }}

                <span
                  v-if="scheduledTrain.stopInfo.comments"
                  :title="scheduledTrain.stopInfo.comments"
                >
                  <img src="/images/icon-warning.svg" />
                </span>
              </span>
              &nbsp;|&nbsp;
              <span>
                {{ scheduledTrain.driverName }}
              </span>

              <div class="info-route">
                <strong>{{ scheduledTrain.beginsAt }} - {{ scheduledTrain.terminatesAt }}</strong>
              </div>

              <ScheduledTrainStatus :scheduledTrain="scheduledTrain" />
            </span>
          </span>

          <span class="timetable-schedule">
            <span class="schedule-arrival">
              <span class="arrival-time begins" v-if="scheduledTrain.stopInfo.beginsHere">
                {{ $t('timetables.begins') }}
              </span>

              <span class="arrival-time" v-else>
                <div v-if="scheduledTrain.stopInfo.arrivalDelay == 0">
                  <span>{{ timestampToString(scheduledTrain.stopInfo.arrivalTimestamp) }}</span>
                </div>
                <div v-else>
                  <div>
                    <s style="margin-right: 0.2em" class="text--grayed">{{
                      timestampToString(scheduledTrain.stopInfo.arrivalTimestamp)
                    }}</s>
                  </div>

                  <span>
                    {{ timestampToString(scheduledTrain.stopInfo.arrivalRealTimestamp) }}
                    ({{ scheduledTrain.stopInfo.arrivalDelay > 0 ? '+' : ''
                    }}{{ scheduledTrain.stopInfo.arrivalDelay }})
                  </span>
                </div>
              </span>
            </span>

            <span class="schedule-stop">
              <span class="stop-connection">
                {{ scheduledTrain.arrivingLine }}
              </span>

              <span class="stop-time">
                {{ scheduledTrain.stopInfo.stopTime || '' }}
                {{
                  scheduledTrain.stopInfo.stopTime ? scheduledTrain.stopInfo.stopType || 'pt' : ''
                }}
              </span>

              <span class="stop-connection">
                {{ scheduledTrain.departureLine }}
              </span>
            </span>

            <span class="schedule-departure">
              <span class="departure-time terminates" v-if="scheduledTrain.stopInfo.terminatesHere">
                {{ $t('timetables.terminates') }}
              </span>

              <span class="departure-time" v-else>
                <div v-if="scheduledTrain.stopInfo.departureDelay == 0">
                  <span>{{ timestampToString(scheduledTrain.stopInfo.departureTimestamp) }}</span>
                </div>
                <div v-else>
                  <div>
                    <s style="margin-right: 0.2em" class="text--grayed">{{
                      timestampToString(scheduledTrain.stopInfo.departureTimestamp)
                    }}</s>
                  </div>

                  <span>
                    {{ timestampToString(scheduledTrain.stopInfo.departureRealTimestamp) }}
                    ({{ scheduledTrain.stopInfo.departureDelay > 0 ? '+' : ''
                    }}{{ scheduledTrain.stopInfo.departureDelay }})
                  </span>
                </div>
              </span>
            </span>
          </span>
        </div>
      </transition-group>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { useRoute } from 'vue-router';

import Loading from '../Global/Loading.vue';
import dateMixin from '../../mixins/dateMixin';
import routerMixin from '../../mixins/routerMixin';
import Station from '../../scripts/interfaces/Station';
import { useStore } from '../../store/mainStore';
import modalTrainMixin from '../../mixins/modalTrainMixin';
import ScheduledTrainStatus from './ScheduledTrainStatus.vue';
import { OnlineScenery } from '../../store/typings';

export default defineComponent({
  name: 'SceneryTimetable',

  components: { Loading, ScheduledTrainStatus },

  mixins: [dateMixin, routerMixin, modalTrainMixin],

  props: {
    station: {
      type: Object as PropType<Station>,
      required: true
    },
    onlineScenery: {
      type: Object as PropType<OnlineScenery>,
      required: false
    }
  },

  data: () => ({
    listOpen: false
  }),

  mounted() {
    this.loadSelectedOption();
  },

  activated() {
    this.loadSelectedOption();
  },

  setup(props) {
    const route = useRoute();
    const currentURL = computed(() => `${location.origin}${route.fullPath}`);

    const store = useStore();

    const chosenCheckpoint = ref(
      props.station?.generalInfo?.checkpoints?.length == 0
        ? ''
        : props.station?.generalInfo?.checkpoints[0].checkpointName || null
    );

    return {
      currentURL,
      chosenCheckpoint,
      store
    };
  },

  computed: {
    tabliceZbiorczeHref() {
      let url = `https://tablice-td2.web.app/?station=${this.station.name}`;
      if (this.chosenCheckpoint) url += `&checkpoint=${this.chosenCheckpoint}`;

      return url;
    },

    computedScheduledTrains() {
      return (
        this.onlineScenery?.scheduledTrains
          ?.filter(
            (train) =>
              train.checkpointName.toLocaleLowerCase() ==
                (this.chosenCheckpoint || this.station.name).toLocaleLowerCase() &&
              train.region == this.store.region.id
          )
          .sort((a, b) => {
            if (a.stopStatusID > b.stopStatusID) return 1;
            if (a.stopStatusID < b.stopStatusID) return -1;

            if (a.stopInfo.arrivalTimestamp > b.stopInfo.arrivalTimestamp) return 1;
            if (a.stopInfo.arrivalTimestamp < b.stopInfo.arrivalTimestamp) return -1;

            return a.stopInfo.departureTimestamp > b.stopInfo.departureTimestamp ? 1 : -1;
          }) || []
      );
    }
  },

  methods: {
    loadSelectedOption() {
      this.chosenCheckpoint =
        this.station.generalInfo?.checkpoints[0]?.checkpointName || this.station.name;
    },

    setCheckpoint(cp: { checkpointName: string }) {
      this.chosenCheckpoint = cp.checkpointName;
    }
  }
});
</script>

<style lang="scss" scoped>
@import '../../styles/responsive.scss';
@import '../../styles/variables.scss';
@import '../../styles/animations.scss';

.scenery-timetable {
  height: 100%;
  overflow-y: scroll;
  padding: 0 0.5em;
}

.timetable-header {
  position: sticky;
  top: 0;
  z-index: 99;

  background-color: #181818;

  padding: 0.5em;

  img {
    width: 25px;
    vertical-align: middle;
  }

  h3 {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;

    gap: 0.5em;
    font-size: 1.3em;
  }
}

.header_links {
  display: flex;
  gap: 0.5em;
  margin-left: 0.5em;
}

.timetable {
  &-count {
    margin-left: 0.5em;
  }

  &-item {
    margin: 0.5em auto;
    padding: 0.5em;
    max-width: 1100px;

    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.2em 0.5em;

    overflow: hidden;

    background: #353535;

    cursor: pointer;
    z-index: 10;

    &.empty {
      padding: 1rem;
      font-size: 1.2em;
      color: #bbb;
    }
  }

  &-general {
    display: flex;
    align-items: center;
    justify-content: space-between;

    text-align: left;
  }

  &-schedule {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.2em;
    align-items: center;

    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
}

.timetable-list {
  position: relative;
}

.timetable-checkpoints {
  display: flex;
  justify-content: center;

  flex-wrap: wrap;
  font-size: 1.1em;

  margin-top: 0.5em;

  button.checkpoint_item {
    color: #aaa;
    display: inline;
  }

  .checkpoint_item.current {
    font-weight: bold;
    color: $accentCol;
  }
}

.general-info {
  display: flex;
  flex-wrap: wrap;

  .info-number {
    color: $accentCol;
  }

  .info-route {
    width: 100%;
  }

  .g-tooltip > .content {
    z-index: 100;
    color: white;

    left: 110%;
  }

  img {
    width: 1.1em;
  }
}

.schedule {
  &-arrival,
  &-departure {
    font-size: 1.15em;
  }

  &-stop {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5em;
    align-items: end;

    .stop-connection {
      font-size: 0.95em;
    }

    .stop-time {
      position: relative;
      inline-size: max-content;
      align-self: center;
      font-size: 0.9em;

      color: $accentCol;

      &::after {
        content: '\027F6';
        display: block;
        font-size: 2.2em;
        line-height: 0.65em;
      }
    }
  }
}

.arrival-time.begins,
.departure-time.terminates {
  font-size: 0.85em;
}

@include smallScreen {
  .timetable-item {
    grid-template-columns: 1fr;
  }
}
</style>
