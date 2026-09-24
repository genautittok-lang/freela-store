export function percentageOf(part: number, whole: number) {
  return (part / 100) * whole;
}

export function isWhatPercent(value: number, whole: number) {
  if (whole === 0) throw new Error("Cannot divide by zero.");
  return (value / whole) * 100;
}

export function percentChange(from: number, to: number) {
  if (from === 0) throw new Error("Cannot calculate change from zero.");
  return ((to - from) / from) * 100;
}

export function vatBreakdown(amount: number, rate: number, from: "net" | "gross") {
  if (rate < 0) throw new Error("VAT rate cannot be negative.");
  const factor = rate / 100;
  if (from === "net") {
    const vat = amount * factor;
    return { net: amount, vat, gross: amount + vat };
  }
  const net = amount / (1 + factor);
  const vat = amount - net;
  return { net, vat, gross: amount };
}

export function discountPrice(price: number, off: number) {
  if (off < 0 || off > 100) throw new Error("Discount must be between 0 and 100.");
  const saved = price * (off / 100);
  return { sale: price - saved, saved };
}

export function marginFrom(cost: number, price: number) {
  if (price === 0) throw new Error("Selling price cannot be zero.");
  const profit = price - cost;
  const margin = (profit / price) * 100;
  const markup = cost === 0 ? null : (profit / cost) * 100;
  return { profit, margin, markup };
}

export function bmi(kg: number, metres: number) {
  if (metres <= 0 || kg <= 0) throw new Error("Height and weight must be positive.");
  const value = kg / (metres * metres);
  let category = "Underweight";
  if (value >= 18.5 && value < 25) category = "Normal";
  else if (value >= 25 && value < 30) category = "Overweight";
  else if (value >= 30) category = "Obesity";
  return { value, category };
}

export function dateDiff(startIso: string, endIso: string) {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Enter valid dates.");
  }
  const ms = end.getTime() - start.getTime();
  const days = Math.round(ms / 86400000);
  const weeks = days / 7;
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let restDays = end.getDate() - start.getDate();
  if (restDays < 0) {
    months -= 1;
    const prev = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    restDays += prev;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { days, weeks, years, months, restDays };
}
