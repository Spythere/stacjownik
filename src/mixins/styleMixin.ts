import Vue from 'vue'
import Component from 'vue-class-component'

// You can declare mixins as the same style as components.
@Component
export default class styleMixin extends Vue {
    calculateStyle(exp: string | number): string {
        const bgColor = exp < 2 ? "#26B0D9" : `hsl(${-exp * 5 + 100},  65%, 50%)`;
        const fontColor = exp > 15 ? "white" : "black";

        return `backgroundColor: ${bgColor}; color: ${fontColor}`;
    }
}
