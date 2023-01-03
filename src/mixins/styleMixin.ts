import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    calculateExpStyle(exp: number, isSupporter = false): string {
      const bgColor = exp > -1 ? (exp < 2 ? '#26B0D9' : `hsl(${-exp * 5 + 100},  85%, 50%)`) : '#666';

      const fontColor = exp > 14 || exp == -1 ? 'white' : 'black';
      const boxShadow = isSupporter ? `box-shadow: 0 0 10px 2px ${bgColor};` : '';

      return `background-color: ${bgColor}; color: ${fontColor}; ${boxShadow};`;
    },

    calculateTextExpStyle(exp: number): string {
      const textColor = exp > -1 ? (exp < 2 ? '#26B0D9' : `hsl(${-exp * 5 + 100},  75%, 50%)`) : '#666';

      return `color: ${textColor};`;
    },

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
    },
  },
});
