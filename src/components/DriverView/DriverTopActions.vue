<template>
    <div class="driver-top-actions">
        <div class="actions-container">
            <div class="actions actions-left">
                <button class="a-button btn--filled btn--image" @click="routerReturn">
                    <img src="/images/icon-back.svg" alt="train icon" />
                    <span>
                        {{ t('trains.driver-return-link') }}
                    </span>
                </button>
            </div>

            <div class="actions actions-right">
                <a class="a-button btn--filled btn--image" :href="`https://srjp-td2.web.app/?id=${chosenTrain.id}`"
                    target="_blank">
                    <span class="hidable">
                        {{ t('trains.driver-srjp-link') }}
                    </span>

                    <img src="/images/icon-srjp.svg" alt="srjp icon" />
                </a>

                <router-link :to="`/journal/timetables?search-driver=${chosenTrain.driverName}`"
                    class="a-button btn--filled btn--image">
                    <span class="hidable">
                        {{ t('trains.driver-journal-link') }}
                    </span>

                    <img src="/images/icon-train.svg" alt="train icon" />
                </router-link>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Train } from '../../typings/common';
import { PropType } from 'vue';

const router = useRouter();
const { t } = useI18n();

defineProps({
    chosenTrain: {
        type: Object as PropType<Train>,
        required: true
    }
});

function routerReturn() {
    router.back();
}
</script>


<style lang="scss" scoped>
@use '../../styles/responsive';


.actions-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.5em;
}

.actions {
    display: flex;
    gap: 0.5em;
}

.actions-container>.actions>.a-button {
    padding: 0.5em;
    border-radius: 0.5em 0.5em 0 0;
}

@include responsive.smallScreen {
    span.hidable {
        display: none;
    }
}
</style>