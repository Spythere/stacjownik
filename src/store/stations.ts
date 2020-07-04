import Vue from 'vue'
import Vuex from 'vuex'

import data from '@/data/stations.json';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        stations: [],
        trainCount: 0,
        connectionState: 0,
        errorMessage: ""
    },
    actions: {
        fetchStations: async ({ commit }) => {
            let onlineStations, statusList: any, onlineTrains: any

            try {
                onlineStations = (await (await fetch('https://api.td2.info.pl:9640/?method=getStationsOnline')).json()).message
                statusList = (await (await fetch('https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1')).json()).message
                onlineTrains = (await (await fetch('https://api.td2.info.pl:9640/?method=getTrainsOnline')).json()).message
            } catch (error) {
                commit('setConnectionState', 1);
                commit('setErrorMessage', error.message);
                throw Error(error.message);
            }

            commit('setTrainCount', onlineTrains.filter((train: any) => train.isOnline && train.region === 'eu').length);

            const mappedStations = onlineStations
                .filter((station: any) => station.region === 'eu')
                .filter((station: any) => station.isOnline)
                .map((
                    { stationName = '', stationHash = '', maxUsers = 0, currentUsers = 0, spawnString = '',
                        dispatcherRate = 0, dispatcherName = '', dispatcherExp = 0, dispatcherId = 0 }) => {

                    const status = statusList.find((s: any) => s[0] === stationHash && s[1] === 'eu')
                    let occupiedTo: string = "---"
                    let occupiedTimestamp: number = 0

                    if (!status)
                        occupiedTo = "NIEZALOGOWANY";
                    else {
                        let occupiedCode: number = status[2];

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

                        if (occupiedCode === 2 && occupiedTimestamp === 0)
                            occupiedTo = "KOŃCZY";
                    }

                    const trains: {} = onlineTrains.filter((train: any) =>
                        train.region === 'eu' && train.isOnline === 1 && train.station.stationName === stationName)

                    const stationData: {} = data.find((station: any) => station.stationName === stationName) || { stationName, stationURL: "" }

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
            commit('setConnectionState', 2);
        }
    },
    mutations: {
        setStations: (state, stations) => state.stations = stations,
        setTrainCount: (state, count) => state.trainCount = count,
        setConnectionState: (state, connState) => state.connectionState = connState,
        setErrorMessage: (state, message) => state.errorMessage = message
    },
    getters: {
        getStations: state => state.stations,
        getTrainCount: state => state.trainCount
    }
})
