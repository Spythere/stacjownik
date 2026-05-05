<template>
  <div class="analysis-box">
    <div class="driver-propositions">
      <h3>{{ t('analysis.propositions.header') }}</h3>

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
            >{{ t('analysis.propositions.third-number') }}
            <b class="text--primary">{{ chosenCategoryRules[0] }}</b> &bull;
          </span>

          <span
            >{{
              t('analysis.propositions.last-nums', {
                count: chosenCategoryRules[1].length
              })
            }}
            <b class="text--primary">{{ chosenCategoryRules[1] }}</b> -
            <b class="text--primary">{{ chosenCategoryRules[2] }}</b></span
          >
        </div>

        <div style="margin-top: 0.5em">
          <b>{{ t('analysis.propositions.title') }}&nbsp;</b>
          <i>{{ numberPropositions.join(', ') }}</i>
        </div>
      </div>

      <div class="no-propositions" v-else>{{ t('analysis.propositions.empty') }}</div>

      <div class="cargo-warnings" v-if="Object.values(cargoWarnings).length > 0">
        <hr class="divider" />

        <h3>{{ t('analysis.warnings.title') }}</h3>

        <div class="warnings-container">
          <div
            v-for="(_, warningKey) of cargoWarnings"
            class="train-badge"
            :class="warningKey.split('-')[2]"
          >
            {{ t('analysis.warnings.' + warningKey) }}
          </div>
        </div>
      </div>
    </div>

    <hr class="divider" />

    <div class="analysis-content">
      <div class="analysis-header">
        <h3>
          {{ t('analysis.title') }}
        </h3>

        {{ analysisLanguage }}
        <button class="btn btn--image" @click="changeAnalysisLanguage('pl')">
          <img src="/images/flags/pl.svg" alt="" width="20" />
        </button>

        <button class="btn btn--image" @click="changeAnalysisLanguage('en')">
          <img src="/images/flags/en.svg" alt="" width="20" />
        </button>
      </div>

      <div class="analysis-html" v-html="analysisHtml"></div>

      <hr class="divider" />

      <div class="analysis-actions">
        <button class="btn btn--action">
          <i class="fa-regular fa-copy"></i>{{ t('analysis.button-copy') }}
        </button>

        <button class="btn btn--action" @click="copyStockToClipboard()">
          <i class="fa-regular fa-copy"></i> {{ t('analysis.stock-copy') }}
        </button>
      </div>

      <p class="number-info"><i>$number</i> {{ t('analysis.number-info') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Train } from '../../typings/common';
import rulesJSON from '../../data/trainNumberRules.json';
import { useApiStore } from '../../store/apiStore';

const { t, locale } = useI18n();

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

const analysisLanguage = ref(locale.value);

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

function copyStockToClipboard() {
  const stockString = props.chosenTrain.stockList.join(';');

  if (!stockString) {
    alert(t('analysis.stock-clipboard-failure'));
    return;
  }

  navigator.clipboard
    .writeText(stockString)
    .then(() => {
      prompt(t('analysis.stock-clipboard-success'), stockString);
    })
    .catch(() => {
      alert(t('analysis.stock-clipboard-failure'));
    });
}

function changeAnalysisLanguage(langId: string) {
  analysisLanguage.value = langId;
}

const chosenCategory = computed(() => {
  return availableCategories.value[chosenCategoryIndex.value];
});

const cargoWarnings = computed(() => {
  const stockList = props.chosenTrain.stockList;

  let warnings: Record<string, number> = {};

  stockList.forEach((stockVehicle) => {
    const [vehicleName, vehicleCargo] = stockVehicle.split(':');

    if (/^WB117/.test(vehicleName)) {
      if (vehicleCargo) {
        // warnings.add('twr-un1965');
        warnings['zags-loaded-twr'] = (warnings['zags-loaded-twr'] || 0) + 1;
      } else {
        // warnings.add('tn-un1965');
        warnings['zags-empty-tn'] = (warnings['zags-empty-tn'] || 0) + 1;
      }
    } else if (/^445Rb/.test(vehicleName)) {
      if (vehicleCargo) {
        // warnings.add(vehicleCargo ? 'tn-un1202' : 'tn-un1202-empty');
        warnings['zans-loaded-tn'] = (warnings['zans-loaded-tn'] || 0) + 1;
      } else {
        // warnings.add(vehicleCargo ? 'tn-un1202' : 'tn-un1202-empty');
        warnings['zans-empty-tn'] = (warnings['zans-empty-tn'] || 0) + 1;
      }
    } else if (/^EDK80/.test(vehicleName)) {
      // warnings.add('pn-edk80');
      warnings['edk80-all-pn'] = (warnings['edk80-all-pn'] || 0) + 1;
    }

    if (/^wt_20/.test(vehicleCargo)) {
      warnings['innofreight-all-pn'] = (warnings['innofreight-all-pn'] || 0) + 1;
    }

    if (/^(tank|vehicles_01|truck)/.test(vehicleCargo)) {
      warnings['military-all-pn'] = (warnings['military-all-pn'] || 0) + 1;
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

const analysisHtml = computed(() => {
  let analysisStr = `${t('analysis.title')}: `;

  analysisStr += `<b>${chosenCategory.value} $number </b> (${props.chosenTrain.stockList[0]}, ${(props.chosenTrain.mass / 1000).toFixed(1)}t, ${props.chosenTrain.length}m)`;

  if (Object.keys(cargoWarnings.value).length > 0) {
    if (Object.keys(cargoWarnings.value).some((k) => k.includes('-twr')))
      analysisStr += `<br>${t('analysis.warnings.has-twr')}`;

    if (Object.keys(cargoWarnings.value).some((k) => k.includes('-tn')))
      analysisStr += `<br>${t('analysis.warnings.has-tn')}`;

    if (cargoWarnings.value['zags-loaded-twr'] || cargoWarnings.value['zags-empty-tn']) {
      analysisStr += `<br><i>33UN1965 ${cargoWarnings.value['zags-loaded-twr'] || 0}/${cargoWarnings.value['zags-empty-tn'] || 0} Zags</i>`;
    }

    if (cargoWarnings.value['zans-loaded-tn'] || cargoWarnings.value['zans-empty-tn']) {
      analysisStr += `<br><i>33UN1203 ${cargoWarnings.value['zans-loaded-tn'] || 0}/${cargoWarnings.value['zans-empty-tn'] || 0} Zans</i>`;
    }

    if (Object.keys(cargoWarnings.value).some((k) => k.includes('-pn'))) {
      analysisStr += `${t('analysis.warnings.has-pn')}:`;

      if (cargoWarnings.value['innofreight-all-pn']) {
        analysisStr += `<br> - Innofreight - przekroczona skrajnia`;
      }

      if (cargoWarnings.value['military-all-pn']) {
        analysisStr += `<br> - transport wojskowy`;
      }
    }
  }

  return analysisStr;
});
</script>

<style lang="scss" scoped>
@use '../../styles/responsive';
@use '../../styles/badge';

hr.divider {
  margin: 0.5em 0;
  border-bottom: #111;
  border-width: 2px;
}

.analysis-box {
  padding: 0.5em;
  margin-bottom: 1em;
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

.warnings-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.analysis-html {
  display: inline-block;
  padding: 0.5em;
  background-color: #2e2e2e;
  margin-top: 0.5em;
  user-select: none;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.5em;

  .btn {
    padding: 0;
  }
}

.analysis-actions {
  display: flex;
  gap: 0.5em;
  margin: 0.5em 0;
}

.number-info {
  font-size: 0.85em;
  color: #aaa;
}

@include responsive.smallScreen {
  .analysis-box {
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
