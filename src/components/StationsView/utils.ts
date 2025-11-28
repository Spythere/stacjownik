import { ActiveSorter } from '../../components/StationsView/typings';
import { ActiveScenery, StationGeneralInfo, Status } from '../../typings/common';
import { Station } from '../../typings/common';

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

const filtersAssociations: Record<string, string> = {
  mechaniczne: 'mechanical',
  ręczne: 'manual',
  'mechaniczne+SPK': 'SPK-M',
  'ręczne+SPK': 'SPK-R',
  'mechaniczne+SCS': 'SCS-M',
  'ręczne+SCS': 'SCS-R',
  współczesna: 'modern',
  historyczna: 'historical',
  kształtowa: 'semaphores',
  mieszana: 'mixed'
};

function filterStatusSection(
  filters: Record<string, any>,
  { dispatcherStatus, dispatcherTimestamp }: ActiveScenery
) {
  return (
    (filters['endingStatus'] && dispatcherStatus == Status.ActiveDispatcher.ENDING) ||
    (filters['unavailableStatus'] &&
      (dispatcherStatus == Status.ActiveDispatcher.UNAVAILABLE ||
        dispatcherStatus == Status.ActiveDispatcher.NOT_LOGGED_IN)) ||
    (filters['afkStatus'] && dispatcherStatus == Status.ActiveDispatcher.AFK) ||
    (filters['noSpaceStatus'] && dispatcherStatus == Status.ActiveDispatcher.NO_SPACE) ||
    (filters['occupied'] && dispatcherStatus != Status.ActiveDispatcher.FREE) ||
    (filters['onlineFromHours'] > 0 &&
      (dispatcherTimestamp ?? 0) <= Date.now() + filters['onlineFromHours'] * 3600000)
  );
}

function filterTimetablesSection(filters: Record<string, any>, station: Station) {
  return (
    (filters['withoutActiveTimetables'] &&
      (!station.onlineInfo || station.onlineInfo.scheduledTrainCount.all == 0)) ||
    (filters['withActiveTimetables'] &&
      station.onlineInfo &&
      (station.onlineInfo.scheduledTrainCount.all != 0 ||
        station.onlineInfo.dispatcherStatus == Status.ActiveDispatcher.FREE))
  );
}

function filterAccessibilitySection(filters: Record<string, any>, station: Station) {
  if (
    filters['nonPublic'] &&
    (!station.generalInfo || station.generalInfo.availability == 'nonPublic')
  )
    return true;

  if (!station.generalInfo) return false;

  const { availability } = station.generalInfo;

  return (
    (filters['unavailable'] && availability == 'unavailable' && !station.onlineInfo) ||
    (filters['abandoned'] && availability == 'abandoned' && !station.onlineInfo) ||
    (filters['default'] && availability == 'default') ||
    (filters['notDefault'] &&
      availability != 'default' &&
      availability != 'abandoned' &&
      availability != 'unavailable')
  );
}

function filterRealitySection(filters: Record<string, any>, generalInfo: StationGeneralInfo) {
  return (filters['real'] && generalInfo.lines) || (filters['fictional'] && !generalInfo.lines);
}

function filterProgramsSection(filters: Record<string, any>, generalInfo: StationGeneralInfo) {
  return (
    (filters['SUP'] && generalInfo.SUP) ||
    (filters['noSUP'] && !generalInfo.SUP) ||
    (filters['ASDEK'] && generalInfo.ASDEK) ||
    (filters['noASDEK'] && !generalInfo.ASDEK)
  );
}

function filterControlsSection(filters: Record<string, any>, generalInfo: StationGeneralInfo) {
  return (
    filters[generalInfo.controlType] == true ||
    filters[filtersAssociations[generalInfo.controlType]] == true
  );
}

function filterSignalsSection(filters: Record<string, any>, generalInfo: StationGeneralInfo) {
  return (
    filters[generalInfo.signalType] == true ||
    filters[filtersAssociations[generalInfo.signalType]] == true ||
    (filters['SBL'] && generalInfo.routes.sblNames.length > 0) ||
    (filters['PBL'] && generalInfo.routes.sblNames.length == 0)
  );
}

function filterStationType(filters: Record<string, any>, generalInfo: StationGeneralInfo) {
  const singleTracks = generalInfo.routes.single.filter((r) => !r.isInternal);
  const doubleTracks = generalInfo.routes.double.filter((r) => !r.isInternal);

  let isJunction = singleTracks.length > 0 && doubleTracks.length > 0;

  return (filters['junction'] && isJunction) || (filters['nonJunction'] && !isJunction);
}

function filterSliderValues(filters: Record<string, any>, generalInfo: StationGeneralInfo) {
  const { availability, reqLevel, routes } = generalInfo;

  const otherAvailability =
    availability == 'nonPublic' || availability == 'unavailable' || availability == 'abandoned';

  const internalRoutes = routes.all.filter((r) => r.isInternal && !r.isRouteSBL && !r.hidden);

  return (
    filters['minLevel'] > reqLevel + (otherAvailability ? 1 : 0) ||
    filters['maxLevel'] < reqLevel + (otherAvailability ? 1 : 0) ||
    filters['minVmax'] > routes.maxRouteSpeed ||
    filters['maxVmax'] < routes.minRouteSpeed ||
    (filters['no-1track'] && routes.single.length != 0) ||
    (filters['no-2track'] && routes.double.length != 0) ||
    filters['minOneWayCatenary'] > routes.singleElectrifiedNames.length ||
    filters['minOneWay'] > routes.singleOtherNames.length ||
    filters['minTwoWayCatenary'] > routes.doubleElectrifiedNames.length ||
    filters['minTwoWay'] > routes.doubleOtherNames.length ||
    filters['minOneWayCatenaryInt'] >
      internalRoutes.filter((r) => r.routeTracks == 1 && r.isElectric == true).length ||
    filters['minOneWayInt'] >
      internalRoutes.filter((r) => r.routeTracks == 1 && r.isElectric == false).length ||
    filters['minTwoWayCatenaryInt'] >
      internalRoutes.filter((r) => r.routeTracks == 2 && r.isElectric == true).length ||
    filters['minTwoWayInt'] >
      internalRoutes.filter((r) => r.routeTracks == 2 && r.isElectric == false).length
  );
}

function filterInputValues(filters: Record<string, any>, generalInfo: StationGeneralInfo) {
  return (
    (filters['authors'].length > 3 &&
      !generalInfo.authors
        ?.map((a) => a.toLocaleLowerCase())
        .includes(filters['authors'].toLocaleLowerCase())) ||
    (filters['projects'].length > 0 && generalInfo.project != filters['projects'])
  );
}

export const sortStations = (a: Station, b: Station, sorter: ActiveSorter) => {
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

    case 'routes-single':
      diff =
        (a.generalInfo?.routes.single.filter((r) => !r.hidden && !r.isInternal).length ?? -1) -
        (b.generalInfo?.routes.single.filter((r) => !r.hidden && !r.isInternal).length ?? -1);
      break;

    case 'routes-double':
      diff =
        (a.generalInfo?.routes.double.filter((r) => !r.hidden && !r.isInternal).length ?? -1) -
        (b.generalInfo?.routes.double.filter((r) => !r.hidden && !r.isInternal).length ?? -1);
      break;

    case 'user':
      diff =
        (b.onlineInfo?.stationTrains ? b.onlineInfo.stationTrains.length : -1) -
        (a.onlineInfo?.stationTrains ? a.onlineInfo.stationTrains.length : -1);
      break;

    case 'like':
      diff =
        (a.onlineInfo ? a.onlineInfo.dispatcherRate : -Infinity) -
        (b.onlineInfo ? b.onlineInfo.dispatcherRate : -Infinity);
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

export const filterStations = (station: Station, filters: Record<string, any>) => {
  if (filters['free'] && (!station.onlineInfo || station.onlineInfo.dispatcherId == -1))
    return false;

  // Scenery Timetables section
  if (filterTimetablesSection(filters, station)) return false;

  // Scenery Accessibility section
  if (filterAccessibilitySection(filters, station)) return false;

  // Scenery Status section
  if (station.onlineInfo && filterStatusSection(filters, station.onlineInfo)) return false;

  if (station.generalInfo) {
    // Scenery Reality section
    if (filterRealitySection(filters, station.generalInfo)) return false;

    // Scenery Additional Programs section
    if (filterProgramsSection(filters, station.generalInfo)) return false;

    // Scenery Controls section
    if (filterControlsSection(filters, station.generalInfo)) return false;

    // Scenery Signalling section(s)
    if (filterSignalsSection(filters, station.generalInfo)) return false;

    // Scenery Station Type section
    if (filterStationType(filters, station.generalInfo)) return false;

    // Scenery sliders
    if (filterSliderValues(filters, station.generalInfo)) return false;

    // Scenery Authors section
    if (filterInputValues(filters, station.generalInfo)) return false;
  }

  return true;
};
