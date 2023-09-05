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

    // Quick actions (TODO)
    handleQuickAction(actionName: string) {
      // switch (actionName) {
      //   case 'all-available':
      //     this.resetFilters();
      //     this.inputs.options
      //       .filter((option) => /^(free|non-public)/.test(option.id))
      //       .forEach((option) => (option.value = !option.defaultValue));
      //     break;
      //   case 'all-free':
      //     this.resetFilters();
      //     this.inputs.options
      //       .filter((option) => /^(free|occupied)/.test(option.id))
      //       .forEach((option) => (option.value = !option.defaultValue));
      //     break;
      //   default:
      //     break;
      // }
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
      if (headerName == this.sorterActive.headerName) this.sorterActive.dir = -1 * this.sorterActive.dir;
      else this.sorterActive.dir = 1;

      this.sorterActive.headerName = headerName;
    },
  },
});
