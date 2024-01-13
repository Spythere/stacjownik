import { PropType, defineComponent } from 'vue';
import dateMixin from '../../mixins/dateMixin';
import { TrainScheduleStop } from './TrainSchedule.vue';

export default defineComponent({
  mixins: [dateMixin],

  props: {
    stop: {
      type: Object as PropType<TrainScheduleStop>,
      required: true
    }
  }
});
