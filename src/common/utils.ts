import { YearMonth } from "@/model/contract";

export const notEmpty = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  return value !== null && value !== undefined;
};

export function createYearMonth(year: number, month: number): YearMonth;
export function createYearMonth(date: Date): YearMonth;

export function createYearMonth(
  param1: number | Date,
  param2?: number
): YearMonth {
  let year: number;
  let month: number;

  if (param1 instanceof Date) {
    year = param1.getFullYear();
    month = param1.getMonth() + 1;
  } else if (typeof param1 === "number" && typeof param2 === "number") {
    year = param1;
    month = param2;

    if (month < 1 || month > 12) {
      throw new Error("Month must be between 1 and 12");
    }
  } else {
    throw new Error("Invalid arguments");
  }

  const yearStr = year.toString().padStart(4, "0");
  const monthStr = month.toString().padStart(2, "0");

  return `${yearStr}-${monthStr}` as YearMonth;
}

export const generateContractNumber = (): string => {
  return Math.floor(Math.random() * 10000).toString();
};

export const calculateSignDate = (yearMonth: YearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);

  const date = new Date(year, month - 1);

  const signDate = new Date(date);
  signDate.setDate(signDate.getDate() - 1);

  return signDate;
};

export const calculateHandOverDate = (yearMonth: YearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);

  const nextMonthDate = new Date(year, month);

  const handOverDate = new Date(nextMonthDate);
  handOverDate.setDate(handOverDate.getDate());

  return handOverDate;
};

export const isProduction = Bun.env.ENV === "production";
