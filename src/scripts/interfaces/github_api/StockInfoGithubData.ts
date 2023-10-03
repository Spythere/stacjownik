export interface RollingStockGithubData {
  usage: Record<string, string>;
  info: RollingStockInfo;
}

export interface RollingStockInfo {
  'loco-e': [string, string, string, string, boolean][];
  'loco-s': [string, string, string, string, boolean][];
  'loco-szt': [string, string, string, string, boolean][];
  'loco-ezt': [string, string, string, string, boolean][];
  'car-passenger': [string, string, boolean, boolean, string][];
  'car-cargo': [string, string, boolean, boolean, string][];
}
