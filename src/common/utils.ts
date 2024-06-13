import { YearMonth } from "@/model/contract";

export const notEmpty = <TValue>(
  value: TValue | null | undefined
): value is TValue => {
  return value !== null && value !== undefined;
};

export const createYearMonth = (year: number, month: number): YearMonth => {
  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12");
  }
  const yearStr = year.toString().padStart(4, "0");
  const monthStr = month.toString().padStart(2, "0");

  return `${yearStr}-${monthStr}` as YearMonth;
};

export const generateContractNumber = (): string => {
  return Math.floor(Math.random() * 10000).toString();
};

export const calculateSignDate = (yearMonth: YearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);

  const date = new Date(year, month - 1);

  const signDate = new Date(date);
  signDate.setDate(signDate.getDate() - 2);

  return signDate;
};

export const calculateHandOverDate = (yearMonth: YearMonth) => {
  const [year, month] = yearMonth.split("-").map(Number);

  const nextMonthDate = new Date(year, month);

  const handOverDate = new Date(nextMonthDate);
  handOverDate.setDate(handOverDate.getDate() + 1);

  return handOverDate;
};
