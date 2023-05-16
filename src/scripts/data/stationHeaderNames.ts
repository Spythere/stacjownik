export const headIds = ['station', 'min-lvl', 'status', 'dispatcher', 'dispatcher-lvl', 'routes', 'general'] as const;

export const headIconsIds = ['user', 'spawn', 'timetableAll', 'timetableUnconfirmed', 'timetableConfirmed'] as const;

export type HeadIdsTypes = typeof headIds[number] | typeof headIconsIds[number];
