<template>
  <div class="driver-propositions">
    <h3>{{ t('trains.number-propositions-header') }}</h3>

    <div class="categories-select">
      <button
        v-for="(category, i) in availableCategories"
        class="btn btn--option btn--action"
        @click="selectCategory(i)"
        :class="{ checked: i == chosenCategoryIndex }"
      >
        {{ category }}
      </button>
    </div>

    <div v-if="numberPropositions.length > 0" class="propositions-numbers">
      <div v-if="chosenCategory">
        <b>{{ chosenCategory }} </b> -
        {{ t(`categories.${chosenCategory.slice(0, 2)}`) }}
        ({{ t(`categories.${chosenCategory.slice(2)}`) }})
      </div>

      <div v-if="chosenCategoryRules">
        <span v-if="chosenCategoryRules[0]"
          >{{ t('trains.number-propositions-third-number') }}
          <b class="text--primary">{{ chosenCategoryRules[0] }}</b> &bull;
        </span>

        <span
          >{{
            t('trains.number-propositions-last-nums', {
              count: chosenCategoryRules[1].length
            })
          }}
          <b class="text--primary">{{ chosenCategoryRules[1] }}</b> -
          <b class="text--primary">{{ chosenCategoryRules[2] }}</b></span
        >
      </div>

      <div style="margin-top: 0.5em">
        <b>{{ t('trains.number-propositions-title') }}&nbsp;</b>
        <i>{{ numberPropositions.join(', ') }}</i>
      </div>
    </div>

    <div class="no-propositions" v-else>{{ t('trains.number-propositions-empty') }}</div>

    <div class="cargo-warnings" v-if="getCargoWarnings.size > 0">
      <hr />
      <h3>{{ t('cargo-warnings.title') }}</h3>

      <div class="warnings-container">
        <div
          v-for="warning in getCargoWarnings"
          class="train-badge"
          :class="`${warning.split('-')[0]}`"
        >
          {{ t('cargo-warnings.' + warning) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Train } from '../../typings/common';
import rulesJSON from '../../data/trainNumberRules.json';
import { useApiStore } from '../../store/apiStore';

const { t } = useI18n();
const apiStore = useApiStore();

const props = defineProps({
  chosenTrain: {
    type: Object as PropType<Train>,
    required: true
  }
});

const emits = defineEmits(['selectCategory']);

const chosenCategoryIndex = ref(0);

const numberPropositions = ref<string[]>([]);
const chosenCategoryRules = ref<any[]>([]);

watch(
  computed(() => props.chosenTrain.trainNo),
  () => {
    chosenCategoryIndex.value = 0;
    generateNumberPropositions();
  }
);

onMounted(() => {
  generateNumberPropositions();
});

function generateNumberPropositions() {
  const categoryCode = chosenCategory.value?.slice(0, 2);
  const trainNoStr = props.chosenTrain.trainNo.toString();

  // Get category rules
  const rules = categoryCode
    ? ((rulesJSON.categoriesRules as any)[categoryCode] as any[])
    : undefined;

  if (!categoryCode || !rules) {
    numberPropositions.value.length = 0;
    chosenCategoryRules.value.length = 0;

    return;
  }

  const [thirdNumber, minRange, maxRange] = rules;

  const propositionsArr: string[] = [];

  for (let i = 0; i < 5; i++) {
    let generatedNumStr = '';

    generatedNumStr += trainNoStr[0] ?? Math.floor(Math.random() * 10);
    generatedNumStr += trainNoStr[1] ?? Math.floor(Math.random() * 10);

    // Third number
    generatedNumStr += thirdNumber ?? '';

    // Remaining numbers
    const rangeNums = minRange?.length ?? 3;

    const randRange = Math.floor(
      Math.random() * (Number(maxRange) - Number(minRange)) + Number(minRange)
    ).toString();

    const leadingZeros = new Array(Math.abs(randRange.toString().length - rangeNums))
      .fill('0')
      .join('');

    generatedNumStr += `${leadingZeros}${randRange}`;

    const isNumberTaken =
      apiStore.activeData?.trains?.some((t) => t.trainNo.toString() == generatedNumStr) ?? false;

    if (!isNumberTaken) {
      propositionsArr.push(generatedNumStr);
    } else {
      i--;
    }

    if (Number(randRange) > Number(maxRange)) break;
  }

  numberPropositions.value = propositionsArr;
  chosenCategoryRules.value = rules;
}

const chosenCategory = computed(() => {
  return availableCategories.value[chosenCategoryIndex.value];
});

const getCargoWarnings = computed(() => {
  const stockList = props.chosenTrain.stockList;

  let warnings: Set<string> = new Set();

  stockList.forEach((stockVehicle) => {
    const [vehicleName, vehicleCargo] = stockVehicle.split(':');

    if (vehicleName.startsWith('WB117')) warnings.add(vehicleCargo ? 'twr-un1965' : 'tn-un1965');
    else if (vehicleName.startsWith('445Rb'))
      warnings.add(vehicleCargo ? 'tn-un1202' : 'tn-un1202-empty');
    else if (vehicleName.startsWith('EDK80')) warnings.add('pn-edk80');

    if (vehicleCargo) {
      if (vehicleCargo.startsWith('wt_20')) warnings.add('pn-innofreight');
      else if (/^(tank|vehicles_01|truck)/.test(vehicleCargo)) warnings.add('pn-military');
    }
  });

  return warnings;
});

const availableCategories = computed(() => {
  const stockList = props.chosenTrain.stockList;
  const headVehicle = stockList[0]?.split('-')[0] ?? '';

  let availableCategories: string[] = [];
  let categoryTraction = 'E';

  let vehicleTypesSet = new Set<string>();
  let wagonsNamesSet = new Set<string>();
  let cargoNamesSet = new Set<string>();

  for (const stockName of stockList) {
    const [vehicleName, ...cargoList] = stockName.split(':');

    const vehicleData = apiStore.vehiclesData?.vehicles.find((v) => v.name == vehicleName);

    if (!vehicleData) continue;

    vehicleTypesSet.add(vehicleData.type);

    if (vehicleData.type.startsWith('wagon-')) wagonsNamesSet.add(vehicleData.name.split('_')[0]);

    if (cargoList !== undefined) cargoList.forEach((c) => cargoNamesSet.add(c.split('_')[0]));
  }

  let vehicleTypesArr = [...vehicleTypesSet];
  let wagonsNamesArr = [...wagonsNamesSet];

  // Traction
  if (vehicleTypesArr[0] == 'loco-electric') categoryTraction = 'E';
  else if (vehicleTypesArr[0] == 'loco-diesel') categoryTraction = 'S';
  else if (vehicleTypesArr[0] == 'unit-electric') categoryTraction = 'J';
  else categoryTraction = 'M';

  // EMU / DMU - M*, R*, P*
  if (vehicleTypesArr.length == 1 && (categoryTraction == 'J' || categoryTraction == 'M')) {
    availableCategories.push('MO', 'MP', 'MM', 'RO', 'RP', 'RA', 'RM', 'PW');
  }
  // Only locos (up to 3) - LT, LP, LS
  else if (stockList.length <= 3 && vehicleTypesArr.every((v) => v.startsWith('loco-'))) {
    if (/^(EU|ET|201E|4E|SU|ST|M62|CTLR4C)/.test(headVehicle)) availableCategories.push('LT');
    if (/^(EU|EP|SU|SP)/.test(headVehicle)) availableCategories.push('LP');
    if (/^(SM)/.test(headVehicle)) availableCategories.push('LS');
  }
  // Only locos (more than 3) - TH
  else if (stockList.length > 3 && vehicleTypesArr.every((v) => v.startsWith('loco-'))) {
    availableCategories.push('TH');
  }
  // Loco(s) + passenger only wagons - M*, R*, E*, P*
  else if (vehicleTypesArr.every((v) => v.startsWith('loco-') || v == 'wagon-passenger')) {
    availableCategories.push('EI', 'EC', 'EN', 'MO', 'MP', 'MM', 'RO', 'RP', 'RA', 'RM', 'PW');
  }
  // Loco(s) + cargo only / mixed wagons - T*, Z*
  else {
    if (wagonsNamesArr.every((v) => /^(627Z|412Z)/.test(v)))
      availableCategories.push('TC', 'TD', 'TS');
    else if (stockList.slice(1).every((v) => /PKPE/.test(v))) {
      availableCategories.push('ZU', 'ZN');
    } else if (wagonsNamesArr.length < 3 || cargoNamesSet.size < 3) {
      availableCategories.push('TM', 'TG', 'TS', 'TK');
    } else {
      availableCategories.push('TN', 'TR', 'TS', 'TK');
    }
  }

  return availableCategories.map((c) => `${c}${categoryTraction}`);
});

function selectCategory(i: number) {
  chosenCategoryIndex.value = i;
  generateNumberPropositions();
}
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';
@use '../../styles/badge';

.driver-propositions {
  margin-bottom: 1em;
  padding: 0.5em;
  background-color: #111;
}

.categories-select {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 0.5em;

  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: calc(-0.5em);
    left: 0;

    width: 100%;
    height: 2px;
    background-color: #aaa;
  }
}

.propositions-numbers {
  margin-top: 1em;
}

.no-propositions {
  margin-top: 1em;
  color: #ccc;
}

.cargo-warnings {
  margin-top: 0.5em;

  h3 {
    margin: 0.5em 0;
  }
}

.warnings-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

@include responsive.smallScreen {
  .driver-propositions {
    text-align: center;
  }

  .categories-select {
    justify-content: center;
  }

  .warnings-container {
    justify-content: center;
  }
}
</style>
