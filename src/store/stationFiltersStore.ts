import { defineStore } from 'pinia';
import inputData from '../data/options.json';
import Filter from '../scripts/interfaces/Filter';
import Station from '../scripts/interfaces/Station';
import StorageManager from '../scripts/managers/storageManager';
import { useStore } from './store';

const sortStations = (a: Station, b: Station, sorter: { index: number; dir: number }) => {
  switch (sorter.index) {
    case 0:
      return sorter.dir == 1 ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);

    case 1:
      if ((a.generalInfo?.reqLevel || 0) > (b.generalInfo?.reqLevel || 0)) return sorter.dir;
      if ((a.generalInfo?.reqLevel || 0) < (b.generalInfo?.reqLevel || 0)) return -sorter.dir;
      break;

    case 2:
      if ((a.onlineInfo?.statusTimestamp || 0) > (b.onlineInfo?.statusTimestamp || 0)) return sorter.dir;
      if ((a.onlineInfo?.statusTimestamp || 0) < (b.onlineInfo?.statusTimestamp || 0)) return -sorter.dir;
      break;

    case 3:
      if ((a.onlineInfo?.dispatcherName.toLowerCase() || '') > (b.onlineInfo?.dispatcherName.toLowerCase() || ''))
        return sorter.dir;
      if ((a.onlineInfo?.dispatcherName.toLowerCase() || '') < (b.onlineInfo?.dispatcherName.toLowerCase() || ''))
        return -sorter.dir;
      break;

    case 4:
      if ((a.onlineInfo?.dispatcherExp || 0) > (b.onlineInfo?.dispatcherExp || 0)) return sorter.dir;
      if ((a.onlineInfo?.dispatcherExp || 0) < (b.onlineInfo?.dispatcherExp || 0)) return -sorter.dir;
      break;

    case 7:
      if ((a.onlineInfo?.currentUsers || 0) > (b.onlineInfo?.currentUsers || 0)) return sorter.dir;
      if ((a.onlineInfo?.currentUsers || 0) < (b.onlineInfo?.currentUsers || 0)) return -sorter.dir;

      if ((a.onlineInfo?.maxUsers || 0) > (b.onlineInfo?.maxUsers || 0)) return sorter.dir;
      if ((a.onlineInfo?.maxUsers || 0) < (b.onlineInfo?.maxUsers || 0)) return -sorter.dir;
      break;

    case 8:
      if ((a.onlineInfo?.spawns.length || 0) > (b.onlineInfo?.spawns.length || 0)) return sorter.dir;
      if ((a.onlineInfo?.spawns.length || 0) < (b.onlineInfo?.spawns.length || 0)) return -sorter.dir;

      break;

    case 9:
      if ((a.onlineInfo?.scheduledTrains?.length || 0) > (b.onlineInfo?.scheduledTrains?.length || 0))
        return sorter.dir;
      if ((a.onlineInfo?.scheduledTrains?.length || 0) < (b.onlineInfo?.scheduledTrains?.length || 0))
        return -sorter.dir;

    default:
      break;
  }

  return a.name.localeCompare(b.name);
};

const filterStations = (station: Station, filters: Filter, isOffline = false) => {
  const returnMode = false;

  if ((station.generalInfo?.availability == 'nonPublic' || !station.generalInfo) && filters['nonPublic'])
    return returnMode;

  if (station.onlineInfo?.statusID == 'ending' && filters['ending']) return returnMode;

  if (
    station.onlineInfo &&
    station.onlineInfo.statusTimestamp > 0 &&
    filters['onlineFromHours'] < 8 &&
    station.onlineInfo.statusTimestamp <= Date.now() + filters['onlineFromHours'] * 3600000
  )
    return returnMode;

  if (filters['onlineFromHours'] > 0 && station.onlineInfo && station.onlineInfo.statusTimestamp <= 0)
    return returnMode;
  if (filters['onlineFromHours'] == 8 && station.onlineInfo?.statusID != 'no-limit') return returnMode;

  if (station.onlineInfo?.statusID == 'ending' && filters['endingStatus']) return returnMode;
  if (
    (station.onlineInfo?.statusID == 'not-signed' || station.onlineInfo?.statusID == 'unavailable') &&
    filters['unavailableStatus']
  )
    return returnMode;
  if (station.onlineInfo?.statusID == 'brb' && filters['afkStatus']) return returnMode;
  if (station.onlineInfo?.statusID == 'no-space' && filters['noSpaceStatus']) return returnMode;

  if (station.onlineInfo && filters['occupied']) return returnMode;
  if (!station.onlineInfo && filters['free']) return returnMode;
  if (station.generalInfo?.availability == 'unavailable' && filters['unavailable'] && !station.onlineInfo)
    return returnMode;

  if (station.generalInfo) {
    const { routes, availability, controlType, lines, reqLevel, signalType, SUP, authors } = station.generalInfo;

    if (availability == 'abandoned' && filters['abandoned'] && !station.onlineInfo) return returnMode;

    if (availability == 'default' && filters['default']) return returnMode;

    if (
      availability != 'default' &&
      filters['notDefault'] &&
      !(availability == 'abandoned' || availability == 'unavailable')
    )
      return returnMode;

    if (filters['real'] && lines) return returnMode;
    if (filters['fictional'] && !lines) return returnMode;

    if (
      reqLevel + (availability == 'nonPublic' || availability == 'unavailable' || availability == 'abandoned' ? 1 : 0) <
      filters['minLevel']
    )
      return returnMode;

    if (
      reqLevel + (availability == 'nonPublic' || availability == 'unavailable' || availability == 'abandoned' ? 1 : 0) >
      filters['maxLevel']
    )
      return returnMode;

    if (
      filters['no-1track'] &&
      (routes.oneWayCatenaryRouteNames.length != 0 || routes.oneWayNoCatenaryRouteNames.length != 0)
    )
      return returnMode;
    if (
      filters['no-2track'] &&
      (routes.twoWayCatenaryRouteNames.length != 0 || routes.twoWayNoCatenaryRouteNames.length != 0)
    )
      return returnMode;

    if (routes.oneWayCatenaryRouteNames.length < filters['minOneWayCatenary']) return returnMode;
    if (routes.oneWayNoCatenaryRouteNames.length < filters['minOneWay']) return returnMode;

    if (routes.twoWayCatenaryRouteNames.length < filters['minTwoWayCatenary']) return returnMode;
    if (routes.twoWayNoCatenaryRouteNames.length < filters['minTwoWay']) return returnMode;

    if (filters[controlType]) return returnMode;
    if (filters[signalType]) return returnMode;

    if (filters['SPK'] && controlType === 'SPK') return returnMode;
    if (filters['SCS'] && controlType === 'SCS') return returnMode;
    if (filters['SPE'] && controlType === 'SPE') return returnMode;
    if (filters['SUP'] && SUP) return returnMode;
    if (filters['noSUP'] && !SUP) return returnMode;

    // if (filters['SCS'] && filters['SPK'] && (controlType.includes('SPK') || controlType.includes('SCS')))
    //   return returnMode;

    if (filters['mechaniczne'] && controlType == 'mechaniczne') return returnMode;
    if (filters['mechaniczne+SPK'] && controlType == 'mechaniczne+SPK') return returnMode;
    if (filters['mechaniczne+SCS'] && controlType == 'mechaniczne+SCS') return returnMode;

    if (filters['ręczne'] && controlType == 'ręczne') return returnMode;
    if (filters['ręczne+SPK'] && controlType == 'ręczne+SPK') return returnMode;
    if (filters['ręczne+SCS'] && controlType == 'ręczne+SCS') return returnMode;

    if (filters['SBL'] && routes.sblRouteNames.length > 0) return returnMode;
    if (filters['PBL'] && routes.sblRouteNames.length == 0) return returnMode;

    if (
      filters['authors'].length > 3 &&
      !authors?.map((a) => a.toLocaleLowerCase()).includes(filters['authors'].toLocaleLowerCase())
    )
      return returnMode;
  }

  return true;
};

const filterInitStates: Filter = {
  default: false,
  notDefault: false,
  real: false,
  fictional: false,
  SPK: false,
  SCS: false,
  SPE: false,
  SUP: false,
  noSUP: false,
  ręczne: false,
  'ręczne+SPK': false,
  'ręczne+SCS': false,
  mechaniczne: false,
  'mechaniczne+SPK': false,
  'mechaniczne+SCS': false,
  współczesna: false,
  kształtowa: false,
  historyczna: false,
  mieszana: false,
  SBL: false,
  PBL: false,
  minLevel: 0,
  maxLevel: 20,
  minOneWayCatenary: 0,
  minOneWay: 0,
  minTwoWayCatenary: 0,
  minTwoWay: 0,
  'include-selected': false,
  'no-1track': false,
  'no-2track': false,
  free: true,
  occupied: false,
  ending: false,
  nonPublic: false,
  unavailable: true,
  abandoned: true,
  afkStatus: false,
  endingStatus: false,
  noSpaceStatus: false,
  unavailableStatus: false,
  unsignedStatus: false,

  authors: '',

  onlineFromHours: 0,
};

export const useStationFiltersStore = defineStore('stationFiltersStore', {
  state() {
    return {
      inputs: inputData,
      filters: { ...filterInitStates },
      sorterActive: { index: 0, dir: 1 },
      store: useStore(),
      lastClickedFilterId: '',
    };
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
        .filter((station) => filterStations(station, this.filters, this.store.isOffline))
        .sort((a, b) => sortStations(a, b, this.sorterActive));
    },

    setupFilters() {
      if (!StorageManager.isRegistered('options_saved')) return;

      this.inputs.options.forEach((option) => {
        if (!StorageManager.isRegistered(option.id)) return;
        const savedValue = StorageManager.getBooleanValue(option.id);

        this.filters[option.id] = savedValue;
        option.value = !savedValue;
      });

      this.inputs.sliders.forEach((slider) => {
        if (!StorageManager.isRegistered(slider.name)) return;
        const savedValue = StorageManager.getNumericValue(slider.name);

        this.filters[slider.name] = savedValue;
        slider.value = savedValue;
      });
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

    changeSorter(index: number) {
      if (index > 4 && index < 7) return;

      if (index == this.sorterActive.index) this.sorterActive.dir = -1 * this.sorterActive.dir;
      else this.sorterActive.dir = 1;

      this.sorterActive.index = index;
    },
  },
});
