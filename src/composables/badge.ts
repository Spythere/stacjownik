export function calculateExpStyles(exp: number, isSupporter = false) {
  const bgColor = exp > -1 ? (exp < 2 ? '#26B0D9' : `hsl(${-exp * 5 + 100},  85%, 50%)`) : '#666';

  const fontColor = exp > 14 || exp == -1 ? 'white' : 'black';
  const boxShadow = isSupporter ? `0 0 6px 2px ${bgColor};` : '';

  return { 'background-color': bgColor, color: fontColor, 'box-shadow': boxShadow };
}
