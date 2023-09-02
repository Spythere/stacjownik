import { defineStore } from 'pinia';
import inputData from '../data/options.json';
import Station from '../scripts/interfaces/Station';
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
      store: useStore(),
      lastClickedFilterId: '',
    };
  },

  getters: {
    areFiltersAtDefault(state) {
      return Object.keys(state.filters).every((f) => state.filters[f] === filterInitStates[f]);
    },
  },

  actions: {
    getFilteredStationList(stationList: Station[], region: string): Station[] {
      return stationList
        .map((station) => {
          if (station.onlineInfo && station.onlineInfo.region != region) {
            delete station.onlineInfo;
          }

          return station;
        })
        .filter((station) => filterStations(station, this.filters))
        .sort((a, b) => sortStations(a, b, this.sorterActive));
    },

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

    handleQuickAction(actionName: string) {
      switch (actionName) {
        case 'all-available':
          this.resetFilters();

          this.changeFilterValue({ name: 'non-public', value: false });
          break;

        default:
          break;
      }
    },

    changeFilterValue(filter: { name: string; value: any }) {
      this.filters[filter.name] = filter.value;

      if (StorageManager.isRegistered('options_saved')) StorageManager.setValue(filter.name, filter.value);
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
      this.inputs.options.forEach((option) => {
        if (option.section != section) return;

        option.value = option.defaultValue;
        this.filters[option.id] = !option.defaultValue;

        StorageManager.setBooleanValue(option.name, !option.defaultValue);
      });
    },

    changeSorter(headerName: HeadIdsTypes) {
      if (headerName == this.sorterActive.headerName) this.sorterActive.dir = -1 * this.sorterActive.dir;
      else this.sorterActive.dir = 1;

      this.sorterActive.headerName = headerName;
    },
  },
});
