import { defineComponent } from "vue";

export default defineComponent({
    methods: {
        navigateToTrain(trainNo: number, driverName: string) {
            this.$router.push({
                name: 'TrainsView',
                query: { trainNo, driverName },
            });
        }
    }
})