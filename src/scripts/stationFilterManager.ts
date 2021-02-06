import Station from '@/scripts/interfaces/Station';

export default class StationFilterManager {
  private filterInitStates = {
    default: false,
    notDefault: false,
    nonPublic: false,
    SPK: false,
    SCS: false,
    ręczne: false,
    mechaniczne: false,
    współczesna: false,
    kształtowa: false,
    historyczna: false,
    mieszana: false,
    minLevel: 0,
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

  private filters = { ...this.filterInitStates };

  private sorter: { index: number; dir: number } = { index: 0, dir: 1 };

  filteredStationList(stationList: Station[]): Station[] {
    return stationList
      .filter(station => {
        if ((station.nonPublic || !station.reqLevel) && this.filters['nonPublic']) return false;

        if (station.online && station.occupiedTo == 'KOŃCZY' && this.filters['ending']) return false;

        if (station.online && this.filters['occupied']) return false;
        if (!station.online && this.filters['free']) return false;

        if (station.default && this.filters['default']) return false;
        if (!station.default && this.filters['notDefault']) return false;

        if (station.reqLevel == '-1') return true;
        if (parseInt(station.reqLevel) < this.filters['minLevel']) return false;

        if (this.filters['no-1track'] && (station.routes.oneWay.catenary != 0 || station.routes.oneWay.noCatenary != 0)) return false;
        if (this.filters['no-2track'] && (station.routes.twoWay.catenary != 0 || station.routes.twoWay.noCatenary != 0)) return false;

        if (station.routes.oneWay.catenary < this.filters['minOneWayCatenary']) return false;
        if (station.routes.oneWay.noCatenary < this.filters['minOneWay']) return false;

        if (station.routes.twoWay.catenary < this.filters['minTwoWayCatenary']) return false;
        if (station.routes.twoWay.noCatenary < this.filters['minTwoWay']) return false;

        if (this.filters[station.controlType]) return false;
        if (this.filters[station.signalType]) return false;

        if (this.filters['SPK'] && (station.controlType === 'SPK' || station.controlType.includes('+SPK'))) return false;
        if (this.filters['SCS'] && (station.controlType === 'SCS' || station.controlType.includes('+SCS'))) return false;

        if (this.filters['SCS'] && this.filters['SPK'] && (station.controlType.includes('SPK') || station.controlType.includes('SCS'))) return false;

        if (this.filters['mechaniczne'] && station.controlType.includes('mechaniczne')) return false;

        if (this.filters['ręczne'] && station.controlType.includes('ręczne')) return false;

        return true;
      })
      .sort((a, b) => {
        switch (this.sorter.index) {
          case 1:
            if (parseInt(a.reqLevel) > parseInt(b.reqLevel)) return this.sorter.dir;
            if (parseInt(a.reqLevel) < parseInt(b.reqLevel)) return -this.sorter.dir;
            break;

          case 2:
            if (a.statusTimestamp > b.statusTimestamp) return this.sorter.dir;
            if (a.statusTimestamp < b.statusTimestamp) return -this.sorter.dir;
            break;

          case 3:
            if (a.dispatcherName.toLowerCase() > b.dispatcherName.toLowerCase()) return this.sorter.dir;
            if (a.dispatcherName.toLowerCase() < b.dispatcherName.toLowerCase()) return -this.sorter.dir;
            break;

          case 4:
            if (a.dispatcherExp > b.dispatcherExp) return this.sorter.dir;
            if (a.dispatcherExp < b.dispatcherExp) return -this.sorter.dir;
            break;

          case 7:
            if (a.currentUsers > b.currentUsers) return this.sorter.dir;
            if (a.currentUsers < b.currentUsers) return -this.sorter.dir;
            if (a.maxUsers > b.maxUsers) return this.sorter.dir;
            if (a.maxUsers < b.maxUsers) return -this.sorter.dir;
            break;

          case 8:
            if (a.spawns > b.spawns) return this.sorter.dir;
            if (a.spawns < b.spawns) return -this.sorter.dir;

            break;

          case 9:
            if (a.scheduledTrains.length > b.scheduledTrains.length) return this.sorter.dir;
            if (a.scheduledTrains.length < b.scheduledTrains.length) return -this.sorter.dir;

          default:
            break;
        }

        if (a.stationName.toLowerCase() >= b.stationName.toLowerCase()) return this.sorter.dir;
        return -this.sorter.dir;
      });
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
