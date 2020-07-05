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
      let onlineStations, statusList: any, onlineTrains: any

      try {
        onlineStations = (await (await fetch('https://api.td2.info.pl:9640/?method=getStationsOnline')).json()).message
        statusList = (await (await fetch('https://api.td2.info.pl:9640/?method=readFromSWDR&value=getDispatcherStatusList%3B1')).json()).message
        onlineTrains = (await (await fetch('https://api.td2.info.pl:9640/?method=getTrainsOnline')).json()).message
      } catch (error) {
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

            if (occupiedCode === 1)
              occupiedTo = "Z/W";

            if (occupiedCode === 2 && occupiedTimestamp === 0)
              occupiedTo = "KOŃCZY";

            if (occupiedCode === 3)
              occupiedTo = "BRAK MIEJSCA";
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
      commit('filterStations');
    },

    addFilter({ commit }, filterId) {
      commit('addFilter', filterId);
      commit('filterStations');
    },

    removeFilter({ commit }, filterId) {
      commit('removeFilter', filterId);
      commit('filterStations');
    }
  },
  mutations: {
    setStations: (state, stations) => state.stations = stations,
    setTrainCount: (state, count) => state.trainCount = count,

    addFilter(state: any, filterId: string) {
      state.filters.push(filterId);

    },
    removeFilter: (state: { filters: string[] }, filterId: string) => {
      state.filters = state.filters.filter((id: string) => id !== filterId);
    },

    filterStations(state: any) {
      let isDefault = state.filters.includes("is-default");
      let isNotDefault = state.filters.includes("not-default");

      let hasSPK = state.filters.includes("control-SPK");
      let hasSCS = state.filters.includes("control-SCS");
      let hasHand = state.filters.includes("control-hands");
      let hasLevers = state.filters.includes("control-levers");

      let modernSignals = state.filters.includes("signals-modern");
      let mixedSignals = state.filters.includes("signals-mixed");
      let historicSignals = state.filters.includes("signals-historic");

      state.filteredStations = state.stations.filter((station: any) => {
        if (isDefault && station.default) return false;
        if (isNotDefault && !station.default) return false;
        if (hasSPK && (station.controlType === "SPK" || station.controlType === "SCS-SPK")) return false;
        if (hasSCS && (station.controlType === "SCS" || station.controlType === "SCS-SPK")) return false;
        if (hasHand && (station.controlType === "ręczne")) return false;
        if (hasLevers && (station.controlType === "mechaniczne"
          || station.controlType === "mechaniczne+SCS"
          || station.controlType === "mechaniczne+SPK")) return false;

        if (modernSignals && (station.signalType === "współczesna")) return false;
        if (mixedSignals && (station.signalType === "mieszana")) return false;
        if (historicSignals && (station.signalType === "kształtowa" || station.signalType === "historyczna")) return false;

        return true;
      })
    }
  },
  getters: {
    getStations: state => state.filteredStations,
    getTrainCount: state => state.trainCount,
    getFilters: (state: any) => state.filters,
  }
})
