import { defineComponent } from 'vue';

export default defineComponent({
    methods: {
        getControlTypeAbbrev(controlType: string) {
            switch (controlType) {
                case 'mechaniczne':
                    return 'M';
                case 'SCS-SPK':
                    return 'S/S';
                case 'ręczne':
                    return 'R';
                case 'mechaniczne+SPK':
                    return 'M';
                case 'ręczne+SPK':
                    return 'R';
                case 'mechaniczne+SCS':
                    return 'M';
                default:
                    return controlType;
            }

        }
    }
})
