export const languageFlagNames = ['pl', 'en', 'de', 'cz', 'sk', 'ru', 'se', 'ua', 'it'];

export function getLanguageNameById(languageId: number) {
  return languageFlagNames[languageId] ?? 'pl';
}
