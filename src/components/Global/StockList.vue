<template>
  <div class="stock-list">
    <ul>
      <li
        v-for="({ vehicleName, vehicleCargo, images, imagesFallbacks }, i) in thumbnailNames"
        :key="i"
      >
        <div class="stock-text">
          <p>{{ vehicleName.replace(/_/g, ' ') }}</p>
          <small v-if="vehicleCargo">({{ vehicleCargo }})</small>
        </div>

        <span>
          <VehicleThumbnail
            v-for="(thumbnailImage, imageIndex) in images"
            :vehicle-name="vehicleName"
            :img-name="thumbnailImage"
            :fallback-name="imagesFallbacks[imageIndex]"
          />
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { useApiStore } from '../../store/apiStore';
import VehicleThumbnail from './VehicleThumbnail.vue';

export default defineComponent({
  components: { VehicleThumbnail },

  props: {
    trainStockList: {
      type: Array as PropType<string[]>,
      required: true
    },
    tractionOnly: {
      type: Boolean,
      required: false
    }
  },

  data() {
    return {
      apiStore: useApiStore()
    };
  },

  computed: {
    computedStockList() {
      return this.tractionOnly ? this.trainStockList.slice(0, 1) : this.trainStockList;
    },

    thumbnailNames() {
      return (this.tractionOnly ? this.trainStockList.slice(0, 1) : this.trainStockList)
        .filter((v) => v.length != 0)
        .map((vehicleString) => {
          const [vehicleName, vehicleCargo] = vehicleString.split(':');

          const vehicleThumbnailData = {
            images: [] as string[],
            imagesFallbacks: [] as string[],
            vehicleName,
            vehicleCargo
          };

          // Generowanie członów EN57
          if (vehicleName.startsWith('EN57')) {
            vehicleThumbnailData['images'] = [
              vehicleName + 'ra',
              vehicleName + 's',
              vehicleName + 'rb'
            ];
            vehicleThumbnailData['imagesFallbacks'] = [
              'unknown_ezt-ra',
              'unknown_ezt-s',
              'unknown_ezt-rb'
            ];
          }
          // Generowanie członów EN71
          else if (vehicleName.startsWith('EN71')) {
            vehicleThumbnailData['images'] = [
              vehicleName + 'ra',
              vehicleName + 'sa',
              vehicleName + 'sb',
              vehicleName + 'rb'
            ];
            vehicleThumbnailData['imagesFallbacks'] = [
              'unknown_ezt-ra',
              'unknown_ezt-sa',
              'unknown_ezt-sb',
              'unknown_ezt-rb'
            ];
          }
          // Generowanie pojazdów i członów 2EN57
          else if (vehicleString.startsWith('2EN57')) {
            const [firstVehicleNumber, secondVehicleNumber] = vehicleString
              .replace('2EN57-', '')
              .split('+');

            vehicleThumbnailData['images'] = [
              `EN57-${firstVehicleNumber}ra`,
              `EN57-${firstVehicleNumber}s`,
              `EN57-${firstVehicleNumber}rb`,
              `EN57-${secondVehicleNumber}ra`,
              `EN57-${secondVehicleNumber}s`,
              `EN57-${secondVehicleNumber}rb`
            ];

            vehicleThumbnailData['imagesFallbacks'] = [
              'unknown_ezt-ra',
              'unknown_ezt-s',
              'unknown_ezt-rb',
              'unknown_ezt-ra',
              'unknown_ezt-s',
              'unknown_ezt-rb'
            ];
          }
          // Generowanie członów Gor77
          else if (vehicleString.startsWith('Gor77')) {
            vehicleThumbnailData['images'] = [
              vehicleName + '-A',
              vehicleName + '-B',
              vehicleName + '-C',
              vehicleName + '-D'
            ];
            vehicleThumbnailData['imagesFallbacks'] = [
              'unknown_Gor77-A',
              'unknown_Gor77-B',
              'unknown_Gor77-C',
              'unknown_Gor77-D'
            ];
          }
          // Generowanie członów ET41
          else if (vehicleString.startsWith('ET41')) {
            vehicleThumbnailData['images'] = [vehicleName + '-A', vehicleName + '-B'];
            vehicleThumbnailData['imagesFallbacks'] = ['unknown_ET41-A', 'unknown_ET41-B'];
          }
          // Generowanie pozostałych pojazdów
          else {
            let fallbackVehicleImage = 'unknown_cargo';

            if (/^(EP|EU|ET|201E)/.test(vehicleName)) fallbackVehicleImage = 'unknown_train';
            else if (/^(SM42)/.test(vehicleName)) fallbackVehicleImage = 'unknown_SM42';
            else if (/(\d{3}a|(Bau|Gor)\d{2}|304C)_/.test(vehicleName))
              fallbackVehicleImage = 'unknown_passenger';

            vehicleThumbnailData['images'] = [vehicleName];
            vehicleThumbnailData['imagesFallbacks'] = [fallbackVehicleImage];
          }

          if (this.tractionOnly) vehicleThumbnailData['images'].length = 1;

          return vehicleThumbnailData;
        });
    }
  },

  methods: {
    onImageError(event: Event, fallbackImage: string) {
      (event.target as HTMLImageElement).src = `/images/${fallbackImage}.png`;
    }
  }
});
</script>

<style lang="scss" scoped>
.stock-list {
  display: flex;
  justify-content: center;
}

.stock-list ul {
  display: flex;
  align-items: flex-end;
  overflow: auto;
  margin: 0 auto;
  padding: 1em 0;
}

ul > li > span {
  display: flex;
  align-items: flex-end;
  cursor: crosshair;
}

img {
  max-height: 60px;
  width: auto;
  height: auto;
}

img.traction-only {
  max-width: 100%;
}

.stock-text {
  text-align: center;
  color: #aaa;
  font-size: 0.9em;
  margin-bottom: 0.25em;
}
</style>
