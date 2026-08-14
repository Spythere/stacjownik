export function calculateExpStyles(exp: number, isSupporter = false) {
  const bgColor = exp >= -1 ? (exp < 2 ? '#26B0D9' : `hsl(${-exp * 3.5 + 90},  85%, 50%)`) : '#666';

  const fontColor = exp == -1 || exp > 17 ? 'white' : 'black';
  const boxShadow = isSupporter ? `box-shadow: 0 0 6px 2px ${bgColor};` : '';

  return { 'background-color': bgColor, color: fontColor, 'box-shadow': boxShadow };
}
