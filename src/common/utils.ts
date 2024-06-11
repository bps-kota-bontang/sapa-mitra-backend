import { MonthYear } from "@/model/contract";

export const notEmpty = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  return value !== null && value !== undefined;
};

export const createMonthYear = (year: number, month: number): MonthYear => {
  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }
  const yearStr = year.toString().padStart(4, "0");
  const monthStr = month.toString().padStart(2, "0");

  return `${yearStr}-${monthStr}` as MonthYear;
};
