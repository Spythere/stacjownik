export const ACTIONS = {
    connectToAPI: "connectToAPI",
    fetchOnlineData: "fetchOnlineData",
    loadStaticStationData: "loadStaticStationData"
}

export const MUTATIONS = {
    SET_DATA_CONNECTION_STATUS: "SET_DATA_CONNECTION_STATUS",
    
    SET_SCENERY_DATA: "SET_SCENERY_DATA",
    SET_SCENERY_DATA_STATUS: "SET_SCENERY_DATA_STATUS",
    SET_DISPATCHER_DATA_STATUS: "SET_DISPATCHER_DATA_STATUS",
    SET_TRAINS_DATA_STATUS: "SET_TRAINS_DATA_STATUS",

    SET_REGION: "SET_REGION",
}

export const GETTERS = {
    stationList: "stationList",
    trainList: "trainList",
    allData: "allData",

    dispatcherDataSWDRStatus: "dispatcherDataSWDRStatus",
    swdrDataStatus: "swdrDataStatus",
    trainsDataStatus: "trainsDataStatus",

    currentRegion: "currentRegion",

    webSocket: "webSocket"
}