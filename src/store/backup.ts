import Vue from 'vue'
import Vuex from 'vuex'
import data from '@/data/stations.json';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        stations: [],
        filteredStations: [],
        filters: [],
        trainCount: 0
    },
    actions: {
        fetchStations: async ({ commit }) => {
            let onlineStations, statusList, onlineTrains

            try {
                onlineStations = (await (await fetch('https://api.td2.info.pl:9640/?method=getStationsOnline')).json()).message
                statusList = (await (await fetch('https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1')).json()).message
                onlineTrains = (await (await fetch('https://api.td2.info.pl:9640/?method=getTrainsOnline')).json()).message
            } catch (error) {
                throw Error(error.message);
            }

            commit('setTrainCount', onlineTrains.filter((train) => train.isOnline && train.region === 'eu').length);

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
                        train.region === 'eu' && train.isOnline === 1 && train.station.stationName === stationName)

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

            commit('setStations', mappedStations);
            commit('filterStations');
        },

        addFilters({ commit }, filterId) {
            commit('addFilters', filterId);
            commit('filterStations');
        },

        removeFilters({ commit }, filterId) {
            commit('removeFilters', filterId);
            commit('filterStations');
        }
    },
    mutations: {
        setStations: (state, stations) => state.stations = stations,
        setTrainCount: (state, count) => state.trainCount = count,

        addFilters(state, filters) {
            state.filters.push(...filters);
        },
        removeFilters: (state, filters) => {
            filters.forEach(filter => {
                state.filters = state.filters.filter((id) => id !== filter);
            })
        },

        filterStations(state) {
            state.filteredStations = state.stations.filter((station) => {
                if (station.default && state.filters.includes("default")) return false;
                if ((!station.default) && state.filters.includes("notDefault")) return false;
                if ((station.nonPublic || !station.reqLevel) && (state.filters.includes("nonPublic"))) return false;

                if (state.filters.includes(station.controlType)) return false;
                if (state.filters.includes(station.signalType)) return false;

                if (station.controlType && state.filters.filter((f) => station.controlType.includes(f)).length > 0) return false;

                return true;
            })
        }
    },
    getters: {
        getStations: state => state.filteredStations,
        getStationCount: state => state.stations.length,
        getTrainCount: state => state.trainCount,
        getFilters: state => state.filters,
    }
})