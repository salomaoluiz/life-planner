interface Rgb {
  b: number;
  g: number;
  r: number;
}

export default function toRgba({ b, g, r }: Rgb, alpha: number): string {
  return `rgba(${r},${g},${b},${alpha})`;
}
