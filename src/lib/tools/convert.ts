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

function tableConvert(table: Record<string, number>, value: number, from: string, to: string, label: string) {
  if (!(from in table) || !(to in table)) throw new Error(`Unknown ${label} unit.`);
  return (value * table[from]) / table[to];
}

export const SPEED: Record<string, number> = { "m/s": 1, "km/h": 1 / 3.6, mph: 0.44704, kn: 0.514444 };
export const AREA: Record<string, number> = { m2: 1, km2: 1e6, ha: 1e4, ft2: 0.092903, acre: 4046.856 };
export const VOLUME: Record<string, number> = { L: 1, mL: 0.001, m3: 1000, gal: 3.785411784, cup: 0.236588 };
export const PRESSURE: Record<string, number> = { Pa: 1, kPa: 1000, bar: 1e5, psi: 6894.757, atm: 101325 };
export const ENERGY: Record<string, number> = { J: 1, kJ: 1000, kcal: 4184, Wh: 3600, kWh: 3.6e6 };
export const DURATION: Record<string, number> = { s: 1, min: 60, h: 3600, d: 86400, wk: 604800 };

export const convertSpeed = (v: number, f: string, t: string) => tableConvert(SPEED, v, f, t, "speed");
export const convertArea = (v: number, f: string, t: string) => tableConvert(AREA, v, f, t, "area");
export const convertVolume = (v: number, f: string, t: string) => tableConvert(VOLUME, v, f, t, "volume");
export const convertPressure = (v: number, f: string, t: string) => tableConvert(PRESSURE, v, f, t, "pressure");
export const convertEnergy = (v: number, f: string, t: string) => tableConvert(ENERGY, v, f, t, "energy");
export const convertDuration = (v: number, f: string, t: string) => tableConvert(DURATION, v, f, t, "time");

export const unitSets: Record<string, string[]> = {
  speed: Object.keys(SPEED),
  area: Object.keys(AREA),
  volume: Object.keys(VOLUME),
  pressure: Object.keys(PRESSURE),
  energy: Object.keys(ENERGY),
  duration: Object.keys(DURATION),
  length: lengthUnits,
  weight: weightUnits,
  temperature: ["C", "F", "K"],
  "data-size": siUnits,
};

export function convertByAction(action: string, value: number, from: string, to: string, system: "si" | "iec" = "si") {
  switch (action) {
    case "length":
      return convertLength(value, from, to);
    case "weight":
      return convertWeight(value, from, to);
    case "temperature":
      return convertTemperature(value, from as "C", to as "C");
    case "data-size":
      return convertDataSize(value, from, to, system);
    case "speed":
      return convertSpeed(value, from, to);
    case "area":
      return convertArea(value, from, to);
    case "volume":
      return convertVolume(value, from, to);
    case "pressure":
      return convertPressure(value, from, to);
    case "energy":
      return convertEnergy(value, from, to);
    case "duration":
      return convertDuration(value, from, to);
    default:
      throw new Error("Unknown converter.");
  }
}
