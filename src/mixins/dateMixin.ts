import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    localeDate(dateString: string) {
        return new Date(dateString).toLocaleDateString("pl-PL", { 
            weekday: "long",
            day: "numeric", 
            month: "2-digit", 
            year: "numeric", 
            hour:"2-digit", 
            minute: "2-digit"
        })
    }
  }
})
