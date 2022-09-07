export type JournalTimetableSearcher = {
  [key in 'search-driver' | 'search-train' | 'search-date']: string;
};
