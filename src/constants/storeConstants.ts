export const ACTIONS = {
    synchronizeData: "synchronizeData",
    fetchOnlineData: "fetchOnlineData",
    fetchTimetableData: "fetchTimetableData"
}

export const MUTATIONS = {
    SET_SCENERY_DATA: "SET_SCENERY_DATA",
    SET_SCENERY_DATA_STATUS: "SET_SCENERY_DATA_STATUS",
    SET_DATA_CONNECTION_STATUS: "SET_DATA_CONNECTION_STATUS",
    UPDATE_STATIONS: "UPDATE_STATIONS",
    UPDATE_TRAINS: "UPDATE_TRAINS",
    UPDATE_TIMETABLES: "UPDATE_TIMETABLES"
}

export const GETTERS = {
    stationList: "stationList",
    trainList: "trainList",
    allData: "allData",
    timetableDataStatus: "timetableDataStatus",
    sceneryDataStatus: "sceneryDataStatus", 
    dataStatus: "dataStatus"
}