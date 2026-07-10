<template>
  <div class="details-stock" v-if="timetable.stockString || stockHistory.length != 0">
    <div class="g-separator"></div>

    <b>{{ $t('journal.stock-preview') }}:</b>

    <div class="stock-specs" style="margin-top: 0.5em">
      <span class="badge specs-badge" v-if="timetable.stockLength">
        <span>{{ $t('journal.stock-length') }}</span>
        <span>
          {{
            currentHistoryIndex == 0
              ? timetable.stockLength
              : stockHistory[currentHistoryIndex].stockLength || timetable.stockLength
          }}m
        </span>
      </span>

      <span class="badge specs-badge" v-if="timetable.stockMass">
        <span>{{ $t('journal.stock-mass') }}</span>
        <span>
          {{
            Math.floor(
              (currentHistoryIndex == 0
                ? timetable.stockMass
                : stockHistory[currentHistoryIndex].stockMass || timetable.stockMass) / 1000
            )
          }}t
        </span>
      </span>
    </div>

    <div class="stock-history">
      <button class="btn btn--action" @click="copyStockToClipboard()">
        <i class="fa-regular fa-copy"></i> {{ $t('journal.stock-copy') }}
      </button>

      <button
        v-for="(sh, i) in stockHistory"
        :key="i"
        class="btn--action"
        :data-checked="i == currentHistoryIndex"
        @click.stop="currentHistoryIndex = i"
      >
        {{ sh.updatedAt }}
      </button>
    </div>

    <div v-if="timetable.stockString" style="margin-top: 1em">
      <StockList
        :trainStockList="
          (currentHistoryIndex == 0
            ? timetable.stockString
            : stockHistory[currentHistoryIndex].stockString
          ).split(';')
        "
        :showPreviews="true"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import StockList from '@/components/Global/StockList.vue';
import i18n from '@/i18n';
import { API } from '@/typings/api';
import { computed, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  timetable: {
    type: Object as PropType<API.TimetableHistory.Data>,
    required: true
  }
});

const currentHistoryIndex = ref(0);

const stockHistory = computed(() => {
  return (
    props.timetable.stockHistory
      .slice()
      .reverse()
      .map((h) => {
        const historyData = h.split('@');
        return {
          updatedAt: new Date(Number(historyData[0])).toLocaleTimeString(i18n.global.locale.value, {
            hour: '2-digit',
            minute: '2-digit'
          }),
          stockString: historyData[1],
          stockMass: Number(historyData[2]) || undefined,
          stockLength: Number(historyData[3]) || undefined
        };
      }) ?? []
  );
});

function copyStockToClipboard() {
  if (!props.timetable) return;

  const currentStockString =
    stockHistory.value[currentHistoryIndex.value]?.stockString ?? props.timetable.stockString;

  if (!currentStockString) {
    alert(t('journal.stock-clipboard-failure'));
    return;
  }

  navigator.clipboard
    .writeText(currentStockString)
    .then(() => {
      prompt(t('journal.stock-clipboard-success'), currentStockString);
    })
    .catch(() => {
      alert(t('journal.stock-clipboard-failure'));
    });
}
</script>

<style lang="scss" scoped>
@use '@/styles/badge';

.stock-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.stock-history {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin-top: 1em;

  button[data-checked='true'] {
    color: var(--clr-primary);
  }
}
</style>
