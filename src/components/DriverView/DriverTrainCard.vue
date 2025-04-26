<template>
  <div class="driver-train-card">
    <TrainInfo :train="chosenTrain" :extended="true" />

    <!-- Train action buttons -->
    <div class="train-stock-actions">
      <button class="btn btn--action" style="margin: 1em 0" @click="copyStockToClipboard()">
        <i class="fa-regular fa-copy"></i> {{ i18n.t('trains.stock-copy') }}
      </button>

      <button class="btn btn--action" style="margin: 1em 0" @click="toggleNumberPropositions()">
        <i class="fa-regular fa-lightbulb"></i> {{ i18n.t('trains.number-propositions') }}
      </button>
    </div>

    <!-- Proposed numbers container -->
    <transition name="view-anim" class="propositions-container">
      <div v-if="arePropositionsVisible">
        <h3 style="margin-bottom: 0.5em">{{ i18n.t('trains.number-propositions-header') }}</h3>

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
            {{ i18n.t(`categories.${chosenCategory.slice(0, 2)}`) }}
            ({{ i18n.t(`categories.${chosenCategory.slice(2)}`) }})
          </div>

          <div v-if="chosenCategoryRules">
            <span v-if="chosenCategoryRules[0]"
              >{{ i18n.t('trains.number-propositions-third-number') }}
              <b class="text--primary">{{ chosenCategoryRules[0] }}</b> &bull;
            </span>

            <span
              >{{
                i18n.t('trains.number-propositions-last-nums', {
                  count: chosenCategoryRules[1].length
                })
              }}
              <b class="text--primary">{{ chosenCategoryRules[1] }}</b> -
              <b class="text--primary">{{ chosenCategoryRules[2] }}</b></span
            >
          </div>

          <div style="margin-top: 0.5em">
            <b>{{ i18n.t('trains.number-propositions-title') }}</b>
            <i>{{ numberPropositions.join(', ') }}</i>
          </div>
        </div>

        <div class="no-propositions" v-else>{{ i18n.t('trains.number-propositions-empty') }}</div>
      </div>
    </transition>

    <StockList :trainStockList="chosenTrain.stockList" />
    <TrainSchedule :train="chosenTrain" />
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from 'vue';
import { Train } from '../../typings/common';
import { useI18n } from 'vue-i18n';
import { useApiStore } from '../../store/apiStore';

import StockList from '../Global/StockList.vue';
import TrainSchedule from '../TrainsView/TrainSchedule.vue';
import TrainInfo from '../TrainsView/TrainInfo.vue';

import rulesJSON from '../../data/trainNumberRules.json';
import { computed } from 'vue';
import { watch } from 'vue';

const apiStore = useApiStore();

const i18n = useI18n();

const arePropositionsVisible = ref(false);
const chosenCategoryIndex = ref(0);

const numberPropositions = ref<string[]>([]);
const chosenCategoryRules = ref<any[]>([]);

const props = defineProps({
  chosenTrain: {
    type: Object as PropType<Train>,
    required: true
  }
});

function copyStockToClipboard() {
  const stockString = props.chosenTrain.stockList.join(';');

  if (!stockString) {
    alert(i18n.t('trains.stock-clipboard-failure'));
    return;
  }

  navigator.clipboard
    .writeText(stockString)
    .then(() => {
      prompt(i18n.t('trains.stock-clipboard-success'), stockString);
    })
    .catch(() => {
      alert(i18n.t('trains.stock-clipboard-failure'));
    });
}

function toggleNumberPropositions() {
  arePropositionsVisible.value = !arePropositionsVisible.value;

  if (arePropositionsVisible.value) generateNumberPropositions();
}

function selectCategory(i: number) {
  chosenCategoryIndex.value = i;

  generateNumberPropositions();
}

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

    generatedNumStr += trainNoStr.at(0) ?? Math.floor(Math.random() * 10);
    generatedNumStr += trainNoStr.at(1) ?? Math.floor(Math.random() * 10);

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
  return availableCategories.value.at(chosenCategoryIndex.value);
});

const availableCategories = computed(() => {
  const stockList = props.chosenTrain.stockList;
  const headVehicle = stockList.at(0)?.split('-')[0] ?? '';

  let availableCategories: string[] = [];
  let categoryTraction = 'E';

  let vehicleTypesSet = new Set<string>();
  let wagonsNamesSet = new Set<string>();
  let cargoNamesSet = new Set<string>();

  for (const stockName of stockList) {
    const [vehicleName, ...cargoList] = stockName.split(':');

    const vehicleData = apiStore.vehiclesData?.find((v) => v.name == vehicleName);

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
      availableCategories.push('TM', 'TG', 'TS');
    } else {
      availableCategories.push('TN', 'TK', 'TR', 'TS');
    }
  }

  return availableCategories.map((c) => `${c}${categoryTraction}`);
});

watch(
  computed(() => `${props.chosenTrain.trainNo}`),
  () => {
    chosenCategoryIndex.value = 0;
    generateNumberPropositions();
  }
);
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';

.driver-train-card {
  padding: 1em;
  background-color: var(--clr-view-bg);
  border-radius: 0 0 0.5em 0.5em;
}

.train-stock-actions {
  display: flex;
  gap: 0.5em;
}

.propositions-container {
  margin-bottom: 1em;
  padding: 0.5em;
  background-color: #111;
}

.categories-select {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.5em;

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

@include responsive.smallScreen {
  .propositions-container {
    text-align: center;
  }

  .categories-select {
    justify-content: center;
  }
}
</style>
