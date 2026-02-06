import { useI18n } from 'vue-i18n';

export function calculateDuration(timestampMs: number) {
  const secondsTotal = Math.floor(timestampMs / 1000);
  const minsTotal = Math.round(timestampMs / 60000);
  const hoursTotal = Math.floor(minsTotal / 60);
  const minsInHour = minsTotal % 60;

  return {
    secondsTotal,
    minsTotal,
    hoursTotal,
    minsInHour
  };
}

export function humanizeDuration(timestampMs: number, showSeconds = false) {
  const { t } = useI18n();

  const duration = calculateDuration(timestampMs);

  return duration.minsTotal >= 60
    ? `${t('journal.hours', { value: duration.hoursTotal }, duration.hoursTotal)} ${t(
        'journal.minutes',
        { value: duration.minsInHour },
        duration.minsInHour
      )}`
    : showSeconds && duration.secondsTotal <= 60
      ? t('journal.seconds', { value: duration.secondsTotal }, duration.secondsTotal)
      : t('journal.minutes', { value: duration.minsTotal }, duration.minsTotal);
}
