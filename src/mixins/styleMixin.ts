import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    statusClasses(occupiedTo: string) {
      let className = '';

      switch (occupiedTo) {
        case 'WOLNA':
          className = 'free';
          break;
        case 'KOŃCZY':
          className = 'ending';
          break;
        case 'NIEZALOGOWANY':
          className = 'not-signed';
          break;
        case 'BEZ LIMITU':
          className = 'no-limit';
          break;
        case 'NIEDOSTĘPNY':
          className = 'unavailable';
          break;
        case 'Z/W':
          className = 'brb';
          break;
        case 'BRAK MIEJSCA':
          className = 'no-space';
          break;
        default:
          break;
      }

      return className;
    }
  }
});
