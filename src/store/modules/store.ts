import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';
import data from '@/data/stations.json';

@Module
class Store extends VuexModule {
    private trainCount: number = 0;
    private stationCount: number = 0;

    private stations: {
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
        online: boolean;
        occupiedTo: string;
    }[] = [];

    private filteredStations: {}[] = [];

    private filterInitStates = {
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
        "minLevel": 0,
        "minOneWayCatenary": 0,
        "minOneWay": 0,
        "minTwoWayCatenary": 0,
        "minTwoWay": 0,
        "no-1track": false,
        "no-2track": false,
        "free": false,
        "occupied": false,
        "ending": false
    } as const;

    private filters: any = this.filterInitStates;

    get getStationCount(): number {
        return this.stationCount;
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
    public async initStations() {
        this.context.commit('loadAllStations');
        this.context.dispatch('fetchStations');

        setInterval(() => this.context.dispatch('fetchStations'), 3000);
    }

    @Action
    private async fetchStations() {
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

        this.context.commit('updateStations', mappedStations);
        this.context.commit('setStationCount');
        this.context.commit('filterStations');
    }

    @Mutation
    private filterStations() {
        this.filteredStations = this.stations.filter(station => {
            if ((station.nonPublic || !station.reqLevel) && this.filters['nonPublic']) return false;
            if (!station.reqLevel) return true;

            if (station.online && this.filters['occupied']) return false;
            if (!station.online && this.filters['free']) return false;
            if (station.online && station.occupiedTo == "KOŃCZY" && this.filters['ending']) return false;

            if (station.default && this.filters['default']) return false;
            if (!station.default && this.filters['notDefault']) return false;

            if (station.reqLevel < this.filters['minLevel']) return false;

            if (this.filters["no-1track"] && (station.routes.oneWay.catenary != 0 || station.routes.oneWay.noCatenary != 0)) return false;
            if (this.filters["no-2track"] && (station.routes.twoWay.catenary != 0 || station.routes.twoWay.noCatenary != 0)) return false;

            if (station.routes.oneWay.catenary < this.filters['minOneWayCatenary']) return false;
            if (station.routes.oneWay.noCatenary < this.filters['minOneWay']) return false;

            if (station.routes.twoWay.catenary < this.filters['minTwoWayCatenary']) return false;
            if (station.routes.twoWay.noCatenary < this.filters['minTwoWay']) return false;

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
    private loadAllStations() {
        this.stations = data.map(stationData => ({
            stationProject: "",
            spawnString: "",
            stationHash: "",
            maxUsers: 0,
            currentUsers: 0,
            dispatcherName: "",
            dispatcherRate: 0,
            dispatcherExp: 0,
            dispatcherId: 0,
            online: false,
            occupiedTo: "WOLNA",
            ...stationData,
        }))

        // WSPARCIE DLA NIEWPISANYCH SCENERII!!!
    }

    @Mutation
    private resetFilterList() {
        this.filters = { ...this.filterInitStates };
    }

    @Mutation
    private updateStations(updatedStations: []) {
        for (let i = 0; i < this.stations.length; i++) {
            const toUpdate: any = updatedStations.find((updated: any) => updated.stationName === this.stations[i].stationName);

            if (!toUpdate) {
                this.stations[i].online = false;
                this.stations[i].occupiedTo = "WOLNA";
                continue;
            }

            this.stations[i] = { ...this.stations[i], ...toUpdate }
            this.stations[i].online = true;
        }
    }

    @Mutation
    private setTrainCount(count: number) {
        this.trainCount = count;
    }

    @Mutation
    private setStationCount() {
        this.stationCount = this.stations.filter(station => station.online).length;
    }

    @Mutation
    private mutateFilter(payload: { filterName: string, value: number | boolean }) {
        this.filters[payload.filterName] = payload.value;
    }

}

export default Store;