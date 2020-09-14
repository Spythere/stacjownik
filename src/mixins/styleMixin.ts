import Vue from 'vue';
import Component from 'vue-class-component';

// You can declare mixins as the same style as components.
@Component
export default class styleMixin extends Vue {
  calculateExpStyle(exp: string | number, isSupporter: boolean = false): string {
    const bgColor = exp > -1 ? (exp < 2 ? '#26B0D9' : `hsl(${-exp * 5 + 100},  65%, 50%)`) : '#888';

    const fontColor = exp > 15 ? 'white' : 'black';
    const boxShadow = isSupporter ? `box-shadow: 0 0 10px 2px ${bgColor}` : '';

    return `backgroundColor: ${bgColor}; color: ${fontColor}; ${boxShadow};`;
  }

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
