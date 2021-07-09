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
  const returnMode = false;

  if ((station.nonPublic || !station.reqLevel) && filters['nonPublic']) return returnMode;

  if (station.online && station.statusID == 'ending' && filters['ending']) return returnMode;

  if (station.online && filters['occupied']) return returnMode;
  if (!station.online && filters['free']) return returnMode;

  if (station.default && filters['default']) return returnMode;
  if (!station.default && filters['notDefault']) return returnMode;

  if (filters['real'] && station.stationLines != '') return returnMode;
  if (filters['fictional'] && station.stationLines == '') return returnMode;

  if (station.reqLevel == '-1') return true;
  if (parseInt(station.reqLevel) < filters['minLevel']) return returnMode;
  if (parseInt(station.reqLevel) > filters['maxLevel']) return returnMode;

  if (filters['no-1track'] && (station.routes.oneWay.catenary != 0 || station.routes.oneWay.noCatenary != 0)) return returnMode;
  if (filters['no-2track'] && (station.routes.twoWay.catenary != 0 || station.routes.twoWay.noCatenary != 0)) return returnMode;

  if (station.routes.oneWay.catenary < filters['minOneWayCatenary']) return returnMode;
  if (station.routes.oneWay.noCatenary < filters['minOneWay']) return returnMode;

  if (station.routes.twoWay.catenary < filters['minTwoWayCatenary']) return returnMode;
  if (station.routes.twoWay.noCatenary < filters['minTwoWay']) return returnMode;

  if (filters[station.controlType]) return returnMode;
  if (filters[station.signalType]) return returnMode;

  if (filters['SPK'] && (station.controlType === 'SPK' || station.controlType.includes('+SPK'))) return returnMode;
  if (filters['SCS'] && (station.controlType === 'SCS' || station.controlType.includes('+SCS'))) return returnMode;
  if (filters['SPE'] && (station.controlType === 'SPE' || station.controlType.includes('+SPE'))) return returnMode;

  if (filters['SCS'] && filters['SPK'] && (station.controlType.includes('SPK') || station.controlType.includes('SCS'))) return returnMode;

  if (filters['mechaniczne'] && station.controlType.includes('mechaniczne')) return returnMode;

  if (filters['ręczne'] && station.controlType.includes('ręczne')) return returnMode;

  if (filters['SBL'] && station.SBL) return returnMode;

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
    nonPublic: false
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

  invertFilters() {
    Object.keys(this.filters).forEach(prop => {
      if(typeof this.filters[prop] !== "boolean") return;      

      this.filters[prop] = !this.filters[prop];
      
    })
    
    // for(let prop in this.filters) {
    //   if(typeof prop !== "boolean") continue;

    //   this.filters[prop] = !this.filterInitStates[prop];

    //   console.log("inverted!");
      
    // }
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
