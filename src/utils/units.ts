export function convertWeight(grams: number, toImperial: boolean): { value: number; unit: string } {
  if (toImperial) {
    const ounces = grams * 0.035274;
    if (ounces >= 16) {
      const pounds = ounces / 16;
      return { value: Number(pounds.toFixed(2)), unit: 'lb' };
    }
    return { value: Number(ounces.toFixed(1)), unit: 'oz' };
  }
  
  if (grams >= 1000) {
    return { value: Number((grams / 1000).toFixed(2)), unit: 'kg' };
  }
  return { value: grams, unit: 'g' };
}

export function formatWeight(grams: number, toImperial: boolean): string {
  const { value, unit } = convertWeight(grams, toImperial);
  return `${value}${unit}`;
}