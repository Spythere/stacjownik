export namespace Status {
  export enum ActiveDispatcher {
    FREE = -3,
    INVALID = -2,
    UNKNOWN = -1,
    NO_LIMIT = 0,
    AFK = 1,
    ENDING = 2,
    NO_SPACE = 3,
    UNAVAILABLE = 4,
    NOT_LOGGED_IN = 5
  }

  export enum Data {
    Offline = -2,
    Initialized = -1,
    Loading = 0,
    Error = 1,
    Loaded = 2,
    Warning = 3
  }
}
