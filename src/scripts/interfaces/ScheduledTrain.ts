import TrainStop from "./TrainStop";

export default interface ScheduledTrain {
    trainId: string;
    trainNo: number;
    
    driverName: string;
    driverId: number;
    currentStationName: string;
    currentStationHash: string;
    category: string;
    stopInfo: TrainStop;

    terminatesAt: string;
    beginsAt: string;

    prevStationName: string;
    nextStationName: string;

    arrivingLine: string | null;
    departureLine: string | null;

    stopLabel: string;
    stopStatus: string;
    stopStatusID: number;
}