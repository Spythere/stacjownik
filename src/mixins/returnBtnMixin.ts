import { defineComponent, h } from "vue";

export default defineComponent({
    data() {
        return {
            icons: {
                arrow: require('@/assets/icon-arrow-asc.svg'),
            },

            showReturnButton: false
        }
    },

    methods: {
        scrollToTop() {
            window.scrollTo({ top: 0 });
        },

        handleScroll() {
            this.showReturnButton = window.scrollY > window.innerHeight * 0.35;            
        }
    },

    activated() {
        window.addEventListener('scroll', this.handleScroll);
    },

    deactivated() {
        window.removeEventListener('scroll', this.handleScroll);
    },
})