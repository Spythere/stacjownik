export type JournalDispatcherSearcher = {
  [key in 'search-dispatcher' | 'search-station' | 'search-date']: string;
};

export interface JournalDispatcherSorter {
  id: 'timestampFrom' | 'duration';
  dir: -1 | 1;
}
