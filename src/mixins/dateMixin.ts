import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    localeDate(dateString: string, locale: string) {
      return new Date(dateString).toLocaleDateString(locale == 'pl' ? 'pl-PL' : 'en-GB', {
        weekday: "long",
        day: "numeric",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    },

    localeDay(dateString: string, locale: string) {
      return new Date(dateString).toLocaleDateString(locale == 'pl' ? 'pl-PL' : 'en-GB', {
        day: "numeric",
        month: "2-digit",
        year: "numeric"
      })
    },

    localeTime(dateString: string, locale: string) {
      return new Date(dateString).toLocaleTimeString(locale == 'pl' ? 'pl-PL' : 'en-GB', {
        hour: "2-digit",
        minute: "2-digit"
      })
    }
  }
})
