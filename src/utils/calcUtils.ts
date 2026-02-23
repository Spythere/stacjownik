export function getCountPercentage(partCount: number, allCount: number, fixedDigits: number) {
  if (allCount == 0) return 0;

  return ((partCount / allCount) * 100).toFixed(fixedDigits);
}
