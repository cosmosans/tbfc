export const wrapIndex = (index: number, count: number) => ((index % count) + count) % count;
export function carouselOffset(index: number, selected: number, count: number) {
  const distance = wrapIndex(index - selected, count);
  return distance > count / 2 ? distance - count : distance;
}
