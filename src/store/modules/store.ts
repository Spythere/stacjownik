import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';
import data from '@/data/stations.json';

@Module
class Store extends VuexModule {
    public trainCount: number = 0;
    public stations: {
        stationName: string;
        stationHash: string;
        maxUsers: number;
        currentUsers: number;
        spawnString: string;
        dispatcherRate: number;
        dispatcherName: string;
        dispatcherExp: number;
        dispatcherId: number;
        stationLines: string;
        stationProject: string;
        reqLevel: string;
        supportersOnly: string;
        signalType: string;
        controlType: string;
        default: boolean;
        nonPublic: boolean;
        routes: { oneWay: { catenary: number; noCatenary: number; }, twoWay: { catenary: number; noCatenary: number; } };
    }[] = [];

    public filteredStations: {}[] = [];

    public filterInitStates = {
        "default": false,
        "notDefault": false,
        "nonPublic": false,
        "SPK": false,
        "SCS": false,
        "ręczne": false,
        "mechaniczne": false,
        "współczesna": false,
        "kształtowa": false,
        "historyczna": false,
        "mieszana": false,
        "levelFrom": 0,
        "levelTo": 20,
        "1track-ne": 0,
        "2track-ne": 0,
        "1track-e": 0,
        "2track-e": 0,
        "no-1track": false,
        "no-2track": false
    } as const;

    public filters = {
        "default": false,
        "notDefault": false,
        "nonPublic": false,
        "SPK": false,
        "SCS": false,
        "ręczne": false,
        "mechaniczne": false,
        "współczesna": false,
        "kształtowa": false,
        "historyczna": false,
        "mieszana": false,
        "levelFrom": 0,
        "levelTo": 20,
        "1track-ne": 0,
        "2track-ne": 0,
        "1track-e": 0,
        "2track-e": 0,
        "no-1track": false,
        "no-2track": false
    } as any;


    get getStationCount(): number {
        return this.stations.length;
    }

    get getTrainCount(): number {
        return this.trainCount;
    }

    get getStations() {
        return this.filteredStations;
    }

    get getFilters() {
        return this.filters;
    }

    @Action
    public setFilter(payload: { filterName: string, value: number | boolean }) {
        this.context.commit('mutateFilter', payload);
        this.context.commit('filterStations');
    }

    @Action
    public resetFilters() {
        this.context.commit('resetFilterList');
        this.context.commit('filterStations');
    }

    @Action
    public async fetchStations() {
        let onlineStations: {
            stationName: string,
            stationHash: string,
            maxUsers: number,
            currentUsers: number,
            spawnString: string,
            dispatcherRate: number,
            dispatcherName: string,
            dispatcherExp: number,
            dispatcherId: number,
            region: string,
            isOnline: number
        }[];

        let statusList: [string, string, number, number][];

        let onlineTrains: { isOnline: number, region: string, station: { stationName: string } }[];

        try {
            onlineStations = (await (await fetch('https://api.td2.info.pl:9640/?method=getStationsOnline')).json()).message
            statusList = (await (await fetch('https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1')).json()).message
            onlineTrains = (await (await fetch('https://api.td2.info.pl:9640/?method=getTrainsOnline')).json()).message
        } catch (error) {
            throw Error(error.message);
        }

        this.context.commit('setTrainCount', onlineTrains.filter((train) => train.isOnline && train.region === 'eu').length);

        const mappedStations = onlineStations
            .filter((station) => station.region === 'eu')
            .filter((station) => station.isOnline)
            .map((
                { stationName = '', stationHash = '', maxUsers = 0, currentUsers = 0, spawnString = '',
                    dispatcherRate = 0, dispatcherName = '', dispatcherExp = 0, dispatcherId = 0 }) => {

                const status = statusList.find((s) => s[0] === stationHash && s[1] === 'eu')
                let occupiedTo = "---"
                let occupiedTimestamp = 0

                if (!status)
                    occupiedTo = "NIEZALOGOWANY";
                else {
                    let occupiedCode = status[2];

                    occupiedTimestamp = status[3];
                    occupiedTo = "NIEDOSTĘPNY";

                    if (occupiedCode === 0) {
                        if (occupiedTimestamp - Date.now() > 21000000)
                            occupiedTo = "BEZ LIMITU";
                        else
                            occupiedTo = new Date(status[3])
                                .toLocaleTimeString('en-US',
                                    { hour12: false, hour: '2-digit', minute: '2-digit' });
                    }

                    if (occupiedCode === 1)
                        occupiedTo = "Z/W";

                    if (occupiedCode === 2 && occupiedTimestamp === 0)
                        occupiedTo = "KOŃCZY";

                    if (occupiedCode === 3)
                        occupiedTo = "BRAK MIEJSCA";
                }

                const trains = onlineTrains.filter((train) =>
                    train.region === 'eu' && train.isOnline && train.station.stationName === stationName)

                const stationData = data.find((station) => station.stationName === stationName) || { stationName, stationURL: "" }

                return {
                    ...stationData,
                    stationHash,
                    maxUsers,
                    currentUsers,
                    spawnString: spawnString && spawnString.split(';').map(v => v.split(',')[6] ? v.split(',')[6] : v.split(',')[0]),
                    dispatcherName,
                    dispatcherRate,
                    dispatcherId,
                    dispatcherExp: dispatcherExp < 2 ? 'L' : dispatcherExp,
                    occupiedTo,
                    trains
                }
            })

        this.context.commit('setStations', mappedStations);
        this.context.commit('filterStations');
    }

    @Mutation
    public filterStations() {
        this.filteredStations = this.stations.filter(station => {


            if ((station.nonPublic || !station.reqLevel) && this.filters['nonPublic']) return false;
            if (!station.reqLevel) return true;

            if (station.default && this.filters['default']) return false;
            if (!station.default && this.filters['notDefault']) return false;

            if (station.reqLevel < this.filters['level-from']) return false;
            if (station.reqLevel > this.filters['level-to']) return false;

            if (this.filters["no-1track"] && (station.routes.oneWay.catenary != 0 || station.routes.oneWay.noCatenary != 0)) return false;
            if (this.filters["no-2track"] && (station.routes.twoWay.catenary != 0 || station.routes.twoWay.noCatenary != 0)) return false;

            if (station.routes.oneWay.catenary < this.filters['1track-e']) return false;
            if (station.routes.oneWay.noCatenary < this.filters['1track-ne']) return false;

            if (station.routes.twoWay.catenary < this.filters['2track-e']) return false;
            if (station.routes.twoWay.noCatenary < this.filters['2track-ne']) return false;


            if (this.filters[station.controlType]) return false;
            if (this.filters[station.signalType]) return false;


            if (this.filters["SPK"] && station.controlType.includes("SPK")) return false;
            if (this.filters["SCS"] && station.controlType.includes("SCS")) return false;
            if (this.filters["mechaniczne"] && station.controlType.includes("mechaniczne")) return false;
            if (this.filters["ręczne"] && station.controlType.includes("ręczne")) return false;

            return true;
        })
    }

    @Mutation
    public resetFilterList() {
        this.filters = { ...this.filterInitStates };
    }

    @Mutation
    public setStations(stations: []) {
        this.stations = stations;
    }

    @Mutation
    public setTrainCount(count: number) {
        this.trainCount = count;
    }

    @Mutation
    public mutateFilter(payload: { filterName: string, value: number | boolean }) {
        this.filters[payload.filterName] = payload.value;
    }

}

export default Store;