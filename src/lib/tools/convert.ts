const LENGTH_TO_M: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const WEIGHT_TO_KG: Record<string, number> = {
  kg: 1,
  g: 0.001,
  lb: 0.45359237,
  oz: 0.028349523125,
};

export function convertLength(value: number, from: string, to: string) {
  if (!(from in LENGTH_TO_M) || !(to in LENGTH_TO_M)) throw new Error("Unknown length unit.");
  return (value * LENGTH_TO_M[from]) / LENGTH_TO_M[to];
}

export function convertWeight(value: number, from: string, to: string) {
  if (!(from in WEIGHT_TO_KG) || !(to in WEIGHT_TO_KG)) throw new Error("Unknown mass unit.");
  return (value * WEIGHT_TO_KG[from]) / WEIGHT_TO_KG[to];
}

export function convertTemperature(value: number, from: "C" | "F" | "K", to: "C" | "F" | "K") {
  let c = value;
  if (from === "F") c = (value - 32) * (5 / 9);
  if (from === "K") c = value - 273.15;
  let out = c;
  if (to === "F") out = c * (9 / 5) + 32;
  if (to === "K") out = c + 273.15;
  if (to === "K" && out < 0) throw new Error("Kelvin cannot be negative.");
  return out;
}

const SI: Record<string, number> = {
  bit: 1 / 8,
  B: 1,
  KB: 1e3,
  MB: 1e6,
  GB: 1e9,
  TB: 1e12,
};

const IEC: Record<string, number> = {
  bit: 1 / 8,
  B: 1,
  KiB: 1024,
  MiB: 1024 ** 2,
  GiB: 1024 ** 3,
  TiB: 1024 ** 4,
};

export function convertDataSize(value: number, from: string, to: string, system: "si" | "iec") {
  const table = system === "si" ? SI : IEC;
  if (!(from in table) || !(to in table)) throw new Error("Unknown data-size unit.");
  return (value * table[from]) / table[to];
}

export const lengthUnits = Object.keys(LENGTH_TO_M);
export const weightUnits = Object.keys(WEIGHT_TO_KG);
export const siUnits = Object.keys(SI);
export const iecUnits = Object.keys(IEC);
