import Station from '@/scripts/interfaces/Station';
import Filter from '@/scripts/interfaces/Filter';

const sortStations = (a: Station, b: Station, sorter: { index: number; dir: number }) => {
  switch (sorter.index) {
    case 1:
      const aLevel = a.reqLevel == "" ? -1 : parseInt(a.reqLevel);
      const bLevel = b.reqLevel == "" ? -1 : parseInt(b.reqLevel);

      if (aLevel > bLevel) return sorter.dir;
      if (aLevel < bLevel) return -sorter.dir;

      break;
    case 2:
      if (a.statusTimestamp > b.statusTimestamp) return sorter.dir;
      if (a.statusTimestamp < b.statusTimestamp) return -sorter.dir;
      break;

    case 3:
      if (a.dispatcherName.toLowerCase() > b.dispatcherName.toLowerCase()) return sorter.dir;
      if (a.dispatcherName.toLowerCase() < b.dispatcherName.toLowerCase()) return -sorter.dir;
      break;

    case 4:
      if (a.dispatcherExp > b.dispatcherExp) return sorter.dir;
      if (a.dispatcherExp < b.dispatcherExp) return -sorter.dir;
      break;

    case 7:
      if (a.currentUsers > b.currentUsers) return sorter.dir;
      if (a.currentUsers < b.currentUsers) return -sorter.dir;
      
      if (a.maxUsers > b.maxUsers) return sorter.dir;
      if (a.maxUsers < b.maxUsers) return -sorter.dir;
      break;

    case 8:
      if (a.spawns > b.spawns) return sorter.dir;
      if (a.spawns < b.spawns) return -sorter.dir;

      break;

    case 9:
      if (a.scheduledTrains.length > b.scheduledTrains.length) return sorter.dir;
      if (a.scheduledTrains.length < b.scheduledTrains.length) return -sorter.dir;

    default:
      break;
  }

  if (a.stationName.toLowerCase() >= b.stationName.toLowerCase()) return sorter.dir;

  return -sorter.dir;
}

const filterStations = (station: Station, filters: Filter) => {
  if ((station.nonPublic || !station.reqLevel) && filters['nonPublic']) return false;

  if (station.online && station.statusID == 'ending' && filters['ending']) return false;

  if (station.online && filters['occupied']) return false;
  if (!station.online && filters['free']) return false;

  if (station.default && filters['default']) return false;
  if (!station.default && filters['notDefault']) return false;

  if (filters['real'] && station.stationLines != '') return false;
  if (filters['fictional'] && station.stationLines == '') return false;

  if (station.reqLevel == '-1') return true;
  if (parseInt(station.reqLevel) < filters['minLevel']) return false;
  if (parseInt(station.reqLevel) > filters['maxLevel']) return false;

  if (filters['no-1track'] && (station.routes.oneWay.catenary != 0 || station.routes.oneWay.noCatenary != 0)) return false;
  if (filters['no-2track'] && (station.routes.twoWay.catenary != 0 || station.routes.twoWay.noCatenary != 0)) return false;

  if (station.routes.oneWay.catenary < filters['minOneWayCatenary']) return false;
  if (station.routes.oneWay.noCatenary < filters['minOneWay']) return false;

  if (station.routes.twoWay.catenary < filters['minTwoWayCatenary']) return false;
  if (station.routes.twoWay.noCatenary < filters['minTwoWay']) return false;

  if (filters[station.controlType]) return false;
  if (filters[station.signalType]) return false;

  if (filters['SPK'] && (station.controlType === 'SPK' || station.controlType.includes('+SPK'))) return false;
  if (filters['SCS'] && (station.controlType === 'SCS' || station.controlType.includes('+SCS'))) return false;
  if (filters['SPE'] && (station.controlType === 'SPE' || station.controlType.includes('+SPE'))) return false;

  if (filters['SCS'] && filters['SPK'] && (station.controlType.includes('SPK') || station.controlType.includes('SCS'))) return false;

  if (filters['mechaniczne'] && station.controlType.includes('mechaniczne')) return false;

  if (filters['ręczne'] && station.controlType.includes('ręczne')) return false;

  return true;
}

export default class StationFilterManager {
  private filterInitStates: Filter = {
    default: false,
    notDefault: false,
    real: false,
    fictional: false,
    SPK: false,
    SCS: false,
    SPE: false,
    ręczne: false,
    mechaniczne: false,
    współczesna: false,
    kształtowa: false,
    historyczna: false,
    mieszana: false,
    minLevel: 0,
    maxLevel: 20,
    minOneWayCatenary: 0,
    minOneWay: 0,
    minTwoWayCatenary: 0,
    minTwoWay: 0,
    'no-1track': false,
    'no-2track': false,
    free: true,
    occupied: false,
    ending: false,
  };

  private filters: Filter = { ...this.filterInitStates };

  private sorter: { index: number; dir: number } = { index: 0, dir: 1 };

  getFilteredStationList(stationList: Station[]): Station[] {
    return stationList
      .filter(station => filterStations(station, this.filters))
      .sort((a, b) => sortStations(a, b, this.sorter));
  }

  changeFilterValue(filter: { name: string; value: number }) {
    this.filters[filter.name] = filter.value;
  }

  resetFilters() {
    this.filters = { ...this.filterInitStates };
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
