export type JournalDispatcherSearcher = {
  [key in 'search-dispatcher' | 'search-station']: string;
};

export interface JournalDispatcherSorter {
  id: 'timestampFrom' | 'duration';
  dir: -1 | 1;
}