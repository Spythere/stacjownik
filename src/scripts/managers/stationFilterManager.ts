import Filter from '../interfaces/Filter';
import Station from '../interfaces/Station';
import StorageManager from './storageManager';

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

const filterStations = (station: Station, filters: Filter) => {
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
    const routes = station.generalInfo.routes;
    const availability = station.generalInfo.availability;

    if (filters['abandoned'] && availability == 'abandoned') return returnMode;

    if (availability == 'default' && filters['default']) return returnMode;
    if (
      availability != 'default' &&
      filters['notDefault'] &&
      !(availability == 'abandoned' || availability == 'unavailable')
    )
      return returnMode;

    if (filters['real'] && station.generalInfo.lines != '') return returnMode;
    if (
      filters['fictional'] &&
      station.generalInfo.lines == '' &&
      availability != 'abandoned' &&
      availability != 'unavailable'
    )
      return returnMode;

    if (
      station.generalInfo.reqLevel +
        (availability == 'nonPublic' || availability == 'unavailable' || availability == 'abandoned' ? 1 : 0) <
      filters['minLevel']
    )
      return returnMode;
    if (
      station.generalInfo.reqLevel +
        (availability == 'nonPublic' || availability == 'unavailable' || availability == 'abandoned' ? 1 : 0) >
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

    if (filters[station.generalInfo.controlType]) return returnMode;
    if (filters[station.generalInfo.signalType]) return returnMode;

    if (
      filters['SPK'] &&
      (station.generalInfo.controlType === 'SPK' || station.generalInfo.controlType.includes('+SPK'))
    )
      return returnMode;
    if (
      filters['SCS'] &&
      (station.generalInfo.controlType === 'SCS' || station.generalInfo.controlType.includes('+SCS'))
    )
      return returnMode;
    if (
      filters['SPE'] &&
      (station.generalInfo.controlType === 'SPE' || station.generalInfo.controlType.includes('+SPE'))
    )
      return returnMode;
    if (filters['SUP'] && station.generalInfo.SUP) return returnMode;

    if (
      filters['SCS'] &&
      filters['SPK'] &&
      (station.generalInfo.controlType.includes('SPK') || station.generalInfo.controlType.includes('SCS'))
    )
      return returnMode;

    if (filters['mechaniczne'] && station.generalInfo.controlType.includes('mechaniczne')) return returnMode;

    if (filters['ręczne'] && station.generalInfo.controlType.includes('ręczne')) return returnMode;

    if (filters['SBL'] && routes.sblRouteNames.length > 0) return returnMode;

    if (
      filters['authors'].length > 3 &&
      !station.generalInfo.authors?.map((a) => a.toLocaleLowerCase()).includes(filters['authors'].toLocaleLowerCase())
    )
      return returnMode;
  }

  return true;
};

export default class StationFilterManager {
  private filterInitStates: Filter = {
    default: false,
    notDefault: false,
    real: false,
    fictional: false,
    SPK: false,
    SCS: false,
    SPE: false,
    SUP: false,
    ręczne: false,
    mechaniczne: false,
    współczesna: false,
    kształtowa: false,
    historyczna: false,
    mieszana: false,
    SBL: false,
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

  private filters: Filter = { ...this.filterInitStates };

  private sorter: { index: number; dir: number } = { index: 0, dir: 1 };

  checkFilters() {
    if (!StorageManager.isRegistered('options_saved')) return;

    Object.keys(this.filterInitStates).forEach((filterKey) => {
      if (StorageManager.isRegistered(filterKey)) return;

      const filterType = typeof this.filterInitStates[filterKey];

      if (filterType === 'boolean')
        StorageManager.setBooleanValue(filterKey, !this.filterInitStates[filterKey] as boolean);

      if (filterType === 'number')
        StorageManager.setNumericValue(filterKey, this.filterInitStates[filterKey] as number);
    });
  }

  getFilteredStationList(stationList: Station[], region: string): Station[] {
    return stationList
      .map((station) => {
        if (station.onlineInfo && station.onlineInfo.region != region) {
          delete station.onlineInfo;
        }

        return station;
      })
      .filter((station) => filterStations(station, this.filters))
      .sort((a, b) => sortStations(a, b, this.sorter));
  }

  changeFilterValue(filter: { name: string; value: number }) {
    this.filters[filter.name] = filter.value;

    // if(filter.name == 'authors')
  }

  resetFilters() {
    this.filters = { ...this.filterInitStates };
  }

  invertFilters() {
    Object.keys(this.filters).forEach((prop) => {
      if (typeof this.filters[prop] !== 'boolean') return;

      this.filters[prop] = !this.filters[prop];
    });
  }

  changeSorter(index: number) {
    if (index > 4 && index < 7) return;

    if (index == this.sorter.index) this.sorter.dir = -1 * this.sorter.dir;
    else this.sorter.dir = 1;

    this.sorter.index = index;
  }

  getSorter() {
    return this.sorter;
  }
}
