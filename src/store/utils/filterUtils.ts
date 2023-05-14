import { HeadIdsTypes } from '../../scripts/data/stationHeaderNames';
import Filter from '../../scripts/interfaces/Filter';
import Station from '../../scripts/interfaces/Station';

export const sortStations = (a: Station, b: Station, sorter: { headerName: HeadIdsTypes; dir: number }) => {
  let diff = 0;

  switch (sorter.headerName) {
    case 'station':
      return sorter.dir == 1 ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);

    case 'min-lvl':
      diff = (a.generalInfo?.reqLevel || 0) - (b.generalInfo?.reqLevel || 0);
      break;

    case 'status':
      diff = (a.onlineInfo?.statusTimestamp || 0) - (b.onlineInfo?.statusTimestamp || 0);
      break;

    case 'dispatcher':
      if ((a.onlineInfo?.dispatcherName.toLowerCase() || '') > (b.onlineInfo?.dispatcherName.toLowerCase() || ''))
        return sorter.dir;
      if ((a.onlineInfo?.dispatcherName.toLowerCase() || '') < (b.onlineInfo?.dispatcherName.toLowerCase() || ''))
        return -sorter.dir;
      break;

    case 'dispatcher-lvl':
      diff = (a.onlineInfo?.dispatcherExp || 0) - (b.onlineInfo?.dispatcherExp || 0);
      break;

    case 'user':
      diff =
        (a.onlineInfo?.currentUsers || a.onlineInfo?.maxUsers || 0) -
        (b.onlineInfo?.currentUsers || b.onlineInfo?.maxUsers || 0);
      break;

    case 'spawn':
      diff = (a.onlineInfo?.spawns.length || 0) - (b.onlineInfo?.spawns.length || 0);
      break;

    case 'timetableConfirmed':
      diff =
        (a.onlineInfo?.scheduledTrains?.filter((train) => train.stopInfo.confirmed).length || 0) -
        (b.onlineInfo?.scheduledTrains?.filter((train) => train.stopInfo.confirmed).length || 0);
      break;

    case 'timetableUnconfirmed':
      diff =
        (a.onlineInfo?.scheduledTrains?.filter((train) => !train.stopInfo.confirmed).length || 0) -
        (b.onlineInfo?.scheduledTrains?.filter((train) => !train.stopInfo.confirmed).length || 0);
      break;

    case 'timetableAll':
      diff = (a.onlineInfo?.scheduledTrains?.length || 0) - (b.onlineInfo?.scheduledTrains?.length || 0);
      break;

    default:
      break;
  }

  if (diff != 0) return Math.sign(diff) * sorter.dir;
  return a.name.localeCompare(b.name);
};

export const filterStations = (station: Station, filters: Filter) => {
  if (!station.onlineInfo && filters['free']) return false;

  if (station.onlineInfo) {
    const { statusID, statusTimestamp } = station.onlineInfo;

    const isEnding = statusID == 'ending' && filters['endingStatus'];
    const isNotSigned = (statusID == 'not-signed' || statusID == 'unavailable') && filters['unavailableStatus'];
    const isAFK = statusID == 'brb' && filters['afkStatus'];
    const isNoSpace = statusID == 'no-space' && filters['noSpaceStatus'];
    const isOccupied = station.onlineInfo && filters['occupied'];

    const isOnlineInBounds =
      (filters['onlineFromHours'] < 8 &&
        statusTimestamp > 0 &&
        statusTimestamp <= Date.now() + filters['onlineFromHours'] * 3600000) ||
      (filters['onlineFromHours'] > 0 && statusTimestamp <= 0) ||
      (filters['onlineFromHours'] == 8 && statusID != 'no-limit');

    if (isEnding || isOnlineInBounds || isNotSigned || isAFK || isNoSpace || isOccupied) return false;
  }

  if ((station.generalInfo?.availability == 'nonPublic' || !station.generalInfo) && filters['nonPublic']) return false;

  if (station.generalInfo) {
    const { routes, availability, controlType, lines, reqLevel, signalType, SUP, authors } = station.generalInfo;

    if (availability == 'unavailable' && filters['unavailable'] && !station.onlineInfo) return false;
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
