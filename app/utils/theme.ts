/**
 * Generate Tailwind-compatible shades from a single color
 * @param {string} hex The hex code to generate shades from
 * @param {boolean} halfShades Generate additional shades, e.g. at 150
 * @returns {{[key: number]: string}}
 */
export function shadesOf(hex: string, halfShades = false) {
  const baseColor = hexToRgbArray(hex);
  const black = [0, 0, 0];
  const white = [255, 255, 255];

  let shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  if(halfShades) shades = [...shades, 150, 250, 350, 450, 550, 650, 750, 850].sort();

  let result: { [key: number]: string } = {};

  for(let shade of shades) {
      const originalShade = shade;

      if(shade === 500) {
          result[shade] = hex;
          continue;
      }

      let isDarkShade = shade > 500;
      if(isDarkShade) shade -= 500;

      const percentage = shade / 500;
      const startColor = isDarkShade ? black : baseColor;
      const endColor = isDarkShade ? baseColor : white;

      result[originalShade] = getColor(percentage, startColor, endColor);
  }

  return result;
}

function hexToRgbArray(hex: string): number[] {
  const originalHex = hex;

  hex = hex.replace('#', '');
  if(hex.length === 3) hex = hex + hex;

  const r = hex.substring(0, 2);
  const g = hex.substring(2, 4);
  const b = hex.substring(4, 6);

  const rgb = [r, g, b].map(channel => {
      try {
          const parsedChannel = parseInt(channel, 16);
          if(parsedChannel < 0 || parsedChannel > 255) throw new Error;
          return parsedChannel;
      } catch {
          throw new Error(`Invalid hex color provided: ${originalHex}`);
      }
  });

  return rgb;
}

function getColor(percentage: number, start: number[], end: number[]): string {
  const rgb = end.map((channel, index) => {
      const startChannel = start[index];
      if (startChannel === undefined) return channel;
      return Math.round(channel + percentage * (startChannel - channel));
  });

  const hex = '#' + rgb.map(channel => {
      const component = channel.toString(16);
      return component.length === 1 ? '0' + component : component;
  }).join('');
  return hex;
}