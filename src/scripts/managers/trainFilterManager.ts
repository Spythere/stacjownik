import { TrainFilter } from "vue";
import Train from "../interfaces/Train";
import TrainStop from "../interfaces/TrainStop";

function confirmedPercentage(stops: TrainStop[] | undefined) {
    if (!stops) return -1;

    return Number(((stops.filter((stop) => stop.confirmed).length / stops.length) * 100).toFixed(0));
};

function currentDelay(stops: TrainStop[] | undefined) {
    if (!stops) return -Infinity;

    const delay =
        stops.find((stop, i) => (i == 0 && !stop.confirmed) || (i > 0 && stops[i - 1].confirmed && !stop.confirmed))
            ?.departureDelay || 0;

    return delay;
};

function filterTrainList(trainList: Train[], searchedTrain: string, searchedDriver: string, filters: TrainFilter[]) {
    
    return trainList.filter(
        (train) =>
            (searchedTrain.length > 0 ? train.trainNo.toString().startsWith(searchedTrain) : true) &&
            (searchedDriver.length > 0 ? train.driverName.toLowerCase().startsWith(searchedDriver.toLowerCase()) : true)
    );
}

function sortTrainList(trainList: Train[], sorterActive: { id: string; dir: number }) {
    return trainList.sort((a: Train, b: Train) => {
        switch (sorterActive.id) {
            case 'mass':
                if (a.mass > b.mass) return sorterActive.dir;
                return -sorterActive.dir;

            case 'distance':
                if ((a.timetableData?.routeDistance || -1) > (b.timetableData?.routeDistance || -1)) return sorterActive.dir;

                return -sorterActive.dir;

            case 'progress':
                if (confirmedPercentage(a.timetableData?.followingStops) > confirmedPercentage(b.timetableData?.followingStops))
                    return sorterActive.dir;

                return -sorterActive.dir;

            case 'delay':
                if (currentDelay(a.timetableData?.followingStops) > currentDelay(b.timetableData?.followingStops))
                    return sorterActive.dir;

                return -sorterActive.dir;

            case 'speed':
                if (a.speed > b.speed) return sorterActive.dir;
                return -sorterActive.dir;

            case 'timetable':
                if (a.trainNo > b.trainNo) return sorterActive.dir;
                return -sorterActive.dir;

            case 'length':
                if (a.length > b.length) return sorterActive.dir;
                return -sorterActive.dir;

            default:
                break;
        }

        return 0;
    });
}

export function filteredTrainList(
    trainList: Train[],
    searchedTrain: string,
    searchedDriver: string,
    sorterActive: { id: string; dir: number },
    filters: TrainFilter[]
) {
    let finalTrainList: Train[] = [];

    const filtered = filterTrainList(trainList, searchedTrain, searchedDriver, filters);

    switch (sorterActive.id) {
        case 'comments':
            const trainsSortedByComments = filtered
                .sort((a, b) => {
                    const commentsA = a.timetableData?.followingStops.some((s) => s.comments) ? 1 : 0;
                    const commentsB = b.timetableData?.followingStops.some((s) => s.comments) ? 1 : 0;

                    return commentsB - commentsA;
                });

            const trainsWithComments = trainsSortedByComments.filter((train) =>
                train.timetableData?.followingStops.some((s) => s.comments)
            );

            const trainsWithoutComments = trainsSortedByComments.slice(trainsWithComments.length);

            finalTrainList.push(...trainsWithComments);
            finalTrainList.push(...sortTrainList(trainsWithoutComments, sorterActive));
            break;

        default:
            finalTrainList.push(...sortTrainList(filtered, sorterActive));
            break;
    }

    return finalTrainList;
};