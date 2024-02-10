import { Filter } from '../../components/StationsView/typings';
import { Status } from '../../typings/common';
import { HeadIdsTypes } from '../data/stationHeaderNames';
import Station from '../interfaces/Station';

const dispatcherStatusPriority = [
  Status.ActiveDispatcher.UNKNOWN,
  Status.ActiveDispatcher.INVALID,
  Status.ActiveDispatcher.NOT_LOGGED_IN,
  Status.ActiveDispatcher.UNAVAILABLE,
  Status.ActiveDispatcher.AFK,
  Status.ActiveDispatcher.ENDING,
  Status.ActiveDispatcher.NO_SPACE,
  undefined
];

export const sortStations = (
  a: Station,
  b: Station,
  sorter: { headerName: HeadIdsTypes; dir: number }
) => {
  let diff = 0;

  switch (sorter.headerName) {
    case 'station':
      return sorter.dir == 1 ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);

    case 'min-lvl':
      diff = (a.generalInfo?.reqLevel || 0) - (b.generalInfo?.reqLevel || 0);
      break;

    case 'status':
      diff =
        (a.onlineInfo?.dispatcherTimestamp ??
          dispatcherStatusPriority.indexOf(a.onlineInfo?.dispatcherStatus)) -
        (b.onlineInfo?.dispatcherTimestamp ??
          dispatcherStatusPriority.indexOf(b.onlineInfo?.dispatcherStatus));
      break;

    case 'dispatcher':
      if (
        (a.onlineInfo?.dispatcherName.toLowerCase() || '') >
        (b.onlineInfo?.dispatcherName.toLowerCase() || '')
      )
        return sorter.dir;
      if (
        (a.onlineInfo?.dispatcherName.toLowerCase() || '') <
        (b.onlineInfo?.dispatcherName.toLowerCase() || '')
      )
        return -sorter.dir;
      break;

    case 'dispatcher-lvl':
      diff = (a.onlineInfo?.dispatcherExp || 0) - (b.onlineInfo?.dispatcherExp || 0);
      break;

    case 'user':
      diff =
        (b.onlineInfo ? b.onlineInfo.currentUsers : -1) -
        (a.onlineInfo ? a.onlineInfo.currentUsers : -1);
      break;

    case 'spawn':
      diff =
        (a.onlineInfo ? a.onlineInfo.spawns.length : -1) -
        (b.onlineInfo ? b.onlineInfo.spawns.length : -1);
      break;

    case 'timetableConfirmed':
      diff =
        (a.onlineInfo?.scheduledTrainCount.confirmed ?? -1) -
        (b.onlineInfo?.scheduledTrainCount.confirmed ?? -1);
      break;

    case 'timetableUnconfirmed':
      diff =
        (a.onlineInfo?.scheduledTrainCount.unconfirmed ?? -1) -
        (b.onlineInfo?.scheduledTrainCount.unconfirmed ?? -1);
      break;

    case 'timetableAll':
      diff =
        (a.onlineInfo?.scheduledTrainCount.all ?? -1) -
        (b.onlineInfo?.scheduledTrainCount.all ?? -1);
      break;

    default:
      break;
  }

  if (diff != 0) return Math.sign(diff) * sorter.dir;
  return a.name.localeCompare(b.name);
};

export const filterStations = (station: Station, filters: Filter) => {
  if (filters['free'] && (!station.onlineInfo || station.onlineInfo.dispatcherId == -1))
    return false;

  if (station.onlineInfo && station.onlineInfo.dispatcherId != -1) {
    const { dispatcherStatus } = station.onlineInfo;

    const excludeEnding =
      dispatcherStatus == Status.ActiveDispatcher.ENDING && filters['endingStatus'];

    const excludeNotSigned =
      (dispatcherStatus == Status.ActiveDispatcher.NOT_LOGGED_IN ||
        dispatcherStatus == Status.ActiveDispatcher.UNAVAILABLE) &&
      filters['unavailableStatus'];

    const excludeAFK = dispatcherStatus == Status.ActiveDispatcher.AFK && filters['afkStatus'];

    const excludeNoSpace =
      dispatcherStatus == Status.ActiveDispatcher.NO_SPACE && filters['noSpaceStatus'];

    const excludeOccupied = station.onlineInfo && filters['occupied'];

    // const isActiveFree =
    //   dispatcherStatus == Status.ActiveDispatcher.FREE && filters['withActiveTimetables'];

    if (excludeEnding || excludeAFK || excludeNoSpace || excludeNotSigned || excludeOccupied)
      return false;

    if (
      filters['onlineFromHours'] > 0 &&
      dispatcherStatus <= Date.now() + filters['onlineFromHours'] * 3600000
    )
      return false;
  }

  if (
    (station.generalInfo?.availability == 'nonPublic' || !station.generalInfo) &&
    filters['nonPublic']
  )
    return false;

  if (station.generalInfo) {
    const { routes, availability, controlType, lines, reqLevel, signalType, SUP, authors } =
      station.generalInfo;

    if (availability == 'unavailable' && filters['unavailable'] && !station.onlineInfo)
      return false;
    if (availability == 'abandoned' && filters['abandoned'] && !station.onlineInfo) return false;
    if (availability == 'default' && filters['default']) return false;

    if (
      availability != 'default' &&
      filters['notDefault'] &&
      !(availability == 'abandoned' || availability == 'unavailable')
    )
      return false;

    if (filters['real'] && lines) return false;
    if (filters['fictional'] && !lines) return false;

    const otherAvailability =
      availability == 'nonPublic' || availability == 'unavailable' || availability == 'abandoned';

    if (reqLevel + (otherAvailability ? 1 : 0) < filters['minLevel']) return false;

    if (reqLevel + (otherAvailability ? 1 : 0) > filters['maxLevel']) return false;

    if (
      filters['no-1track'] &&
      (routes.oneWayCatenaryRouteNames.length != 0 || routes.oneWayNoCatenaryRouteNames.length != 0)
    )
      return false;

    if (
      filters['no-2track'] &&
      (routes.twoWayCatenaryRouteNames.length != 0 || routes.twoWayNoCatenaryRouteNames.length != 0)
    )
      return false;

    if (routes.oneWayCatenaryRouteNames.length < filters['minOneWayCatenary']) return false;
    if (routes.oneWayNoCatenaryRouteNames.length < filters['minOneWay']) return false;

    if (routes.twoWayCatenaryRouteNames.length < filters['minTwoWayCatenary']) return false;
    if (routes.twoWayNoCatenaryRouteNames.length < filters['minTwoWay']) return false;

    if (filters[controlType]) return false;
    if (filters[signalType]) return false;

    if (filters['SUP'] && SUP) return false;
    if (filters['noSUP'] && !SUP) return false;

    if (filters['SBL'] && routes.sblRouteNames.length > 0) return false;
    if (filters['PBL'] && routes.sblRouteNames.length == 0) return false;

    if (
      filters['authors'].length > 3 &&
      !authors?.map((a) => a.toLocaleLowerCase()).includes(filters['authors'].toLocaleLowerCase())
    )
      return false;
  }

  return true;
};
