import { DateTime } from 'luxon';

export const parseDouble = (str: string) => {
  if (str === undefined) return undefined;

  const v2 = str.replace(',', '.');
  const p1 = parseFloat(str);
  const p2 = parseFloat(v2);

  if (Math.abs(p1) > Math.abs(p2)) return p1;
  return p2;
};

export const weekInfo = (key: string):DateTime => DateTime.fromFormat(key, 'yyyy_WW');

export const padNumber = (number: number, padding = 2) => String(number).padStart(padding, '0');
export const round2 = (num: number) => Math.round(num * 100) / 100;
const xPipe = (a, b) => (arg) => b(a(arg));
export const pipe = (...ops) => ops.reduce(xPipe);

export type ExpenseEntity={
  date: DateTime;
  value: number;
  category: string;
  name: string;
}

export type MyExpenseWeek= {
  weekStart: DateTime;
  topExpenses: ExpenseEntity[];
  topCategories: string;
}

type GroupByCat= {
  name: string;
  value: number;
}

export type Workload ={
  entities?: ExpenseEntity[];
  groupedByWeek?: { [key: string]: ExpenseEntity[] };
  expenseByWeek?: { [key: string]: number };
  weekDates?: { [key: string]: DateTime };
  week2Cat?: { [key: string]: GroupByCat[]};
  week2Exp?: { [key: string]: ExpenseEntity[] };
  week2Descr? : { [key: string]: string };
}
