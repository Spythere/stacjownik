export namespace Status {
  export enum ActiveDispatcher {
    INVALID = -2,
    UNKNOWN = -1,
    AFK = 1,
    ENDING = 2,
    NO_SPACE = 3,
    UNAVAILABLE = 4,
    NOT_LOGGED_IN = 5
  }

  export enum Data {
    Initialized = -1,
    Loading = 0,
    Error = 1,
    Loaded = 2,
    Warning = 3
  }
}
