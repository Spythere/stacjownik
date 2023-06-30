import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    localeDate(dateString: string, locale: string) {
      return new Date(dateString).toLocaleDateString(locale == 'pl' ? 'pl-PL' : 'en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    localeDay(dateString: string, locale: string) {
      return new Date(dateString).toLocaleDateString(locale == 'pl' ? 'pl-PL' : 'en-GB', {
        day: 'numeric',
        month: '2-digit',
        year: 'numeric',
      });
    },

    localeTime(dateString: string, locale: string) {
      return new Date(dateString).toLocaleTimeString(locale == 'pl' ? 'pl-PL' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    },

    stringToDate(dateString?: string) {
      return dateString ? new Date(dateString) : null;
    },

    parseDateToTimeString(date: Date | null) {
      return (
        date?.toLocaleTimeString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit',
        }) || ''
      );
    },

    timestampToString(timestamp: number | null) {
      return timestamp
        ? new Date(timestamp).toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '';
    },

    calculateDuration(timestampMs: number, showSeconds = false) {
      const secondsTotal = Math.floor(timestampMs / 1000);
      const minsTotal = Math.round(timestampMs / 60000);
      const hoursTotal = Math.floor(minsTotal / 60);
      const minsInHour = minsTotal % 60;

      return minsTotal >= 60
        ? `${this.$t('journal.hours', { value: hoursTotal }, hoursTotal)} ${this.$t(
            'journal.minutes',
            { value: minsInHour },
            minsInHour
          )}`
        : showSeconds && secondsTotal <= 60
        ? this.$t('journal.seconds', { value: secondsTotal }, secondsTotal)
        : this.$t('journal.minutes', { value: minsTotal }, minsTotal);
    },
  },
});
