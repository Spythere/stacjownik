import { defineStore } from 'pinia';
import inputData from '../data/options.json';
import StorageManager from '../scripts/managers/storageManager';
import { useStore } from './store';
import { filterInitStates } from '../scripts/constants/stores/initFilterStates';
import { filterStations, sortStations } from '../scripts/utils/filterUtils';
import { HeadIdsTypes } from '../scripts/data/stationHeaderNames';

export const useStationFiltersStore = defineStore('stationFiltersStore', {
  state() {
    return {
      inputs: inputData,
      filters: { ...filterInitStates },
      sorterActive: { headerName: 'station' as HeadIdsTypes, dir: 1 },
      lastClickedFilterId: ''
    };
  },

  getters: {
    areFiltersAtDefault: (state) => {
      return Object.keys(state.filters).every((f) => state.filters[f] === filterInitStates[f]);
    },

    filteredStationList: (state) => {
      const store = useStore();
      return store.stationList
        .map((station) => ({
          ...station,
          onlineInfo: store.onlineSceneryList.find((os) => os.name == station.name)
        }))
        .filter((station) => filterStations(station, state.filters))
        .sort((a, b) => sortStations(a, b, state.sorterActive));
    }
  },

  actions: {
    setupFilters() {
      if (!StorageManager.isRegistered('options_saved')) return;

      this.inputs.options.forEach((option) => {
        if (!StorageManager.isRegistered(option.name)) return;
        const savedValue = StorageManager.getBooleanValue(option.name);

        this.filters[option.name] = savedValue;
        option.value = !savedValue;
      });

      this.inputs.sliders.forEach((slider) => {
        if (!StorageManager.isRegistered(slider.name)) return;
        const savedValue = StorageManager.getNumericValue(slider.name);

        this.filters[slider.name] = savedValue;
        slider.value = savedValue;
      });
    },

    changeFilterValue(name: string, value: any) {
      this.filters[name] = value;
      if (StorageManager.isRegistered('options_saved')) StorageManager.setValue(name, value);
    },

    resetFilters() {
      this.filters = { ...filterInitStates };

      this.inputs.options.forEach((option) => {
        option.value = option.defaultValue;
        StorageManager.setBooleanValue(option.name, !option.defaultValue);
      });

      this.inputs.sliders.forEach((slider) => {
        slider.value = slider.defaultValue;
        StorageManager.setNumericValue(slider.name, slider.defaultValue);
      });
    },

    resetSectionOptions(section: string) {
      this.inputs.options
        .filter((option) => option.section == section)
        .forEach((option) => {
          option.value = option.defaultValue;
          StorageManager.setBooleanValue(option.name, !option.defaultValue);
        });
    },

    changeSorter(headerName: HeadIdsTypes) {
      if (headerName == this.sorterActive.headerName)
        this.sorterActive.dir = -1 * this.sorterActive.dir;
      else this.sorterActive.dir = 1;

      this.sorterActive.headerName = headerName;
    }
  }
});
