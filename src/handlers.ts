import * as fs from 'fs';
import {
  ExpenseEntity, padNumber, round2, Workload,
} from './utils';

const stringTable = require('string-table');

export const createWorkload = (entities: ExpenseEntity[]):Workload => ({ entities });

export const sortByDateDesc = (workload:Workload) => ({
  ...workload,
  entities: workload.entities.sort(
    (a, b) => b.date.toUnixInteger() - a.date.toUnixInteger(),
  ),
});

export const roundEntities = (workload: Workload) => ({
  ...workload,
  entities: workload.entities.map((e) => ({ ...e, value: Math.round(e.value * 100) / 100 })),
});

export const myGroupByWeek = (workload: Workload) => {
  const groupedByWeek: any = {};
  const weekDates: any = {};
  const expenseByWeek: { [key: number]: number } = {};
  workload.entities.forEach((e) => {
    const { weekNumber, year } = e.date;

    const week = `${year}_${padNumber(weekNumber)}`;
    weekDates[week] = e.date;
    if (!Array.isArray(groupedByWeek[week])) groupedByWeek[week] = [];
    groupedByWeek[week].push(e);

    if (expenseByWeek[week] === undefined) expenseByWeek[week] = 0;
    if (e.value < 0) expenseByWeek[week] += e.value;
  });

  return {
    ...workload,
    groupedByWeek,
    expenseByWeek,
    weekDates,
  };
};

type GroupByCat= {
  name: string;
  value: number;
}

export const maxExpenses = (workload: Workload) => {
  const { groupedByWeek } = workload;
  const week2Cat: { [key: number]: GroupByCat[]} = {};
  const week2Exp: { [key: number]: ExpenseEntity[] } = {};
  Object.keys(groupedByWeek)
    .sort((k1, k2) => parseInt(k1, 10) - parseInt(k2, 10)).forEach((key) => {
      const expCat: GroupByCat[] = [];
      const expAll: ExpenseEntity[] = [];

      (groupedByWeek[key] as ExpenseEntity[]).forEach((v) => {
        const found = expCat.find((c) => c.name === v.category);
        if (found) found.value += v.value;
        else expCat.push({ name: v.category, value: v.value });

        expAll.push(v);
      });

      week2Exp[key] = expAll.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
      week2Cat[key] = expCat.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    });

  return {
    ...workload,
    week2Exp,
    week2Cat,
  };
};

export const printMax = (workload: Workload) => {
  const { week2Cat, week2Exp, expenseByWeek } = workload;
  Object.keys(week2Cat).forEach((k) => {
    const tableprint: any[] = [];

    const wi = workload.weekDates[k];
    console.log(`Week number = ${k} - ${wi.startOf('week').toFormat('yyyy-MM-dd')} - ${wi.endOf('week').toFormat('yyyy-MM-dd')}`
    + ` exp=${round2(expenseByWeek[k])}`);

    if (workload.week2Descr[k]) {
      console.log(`Description= ${workload.week2Descr[k]}`);
    }

    week2Cat[k].slice(0, 10).forEach((w2c: GroupByCat, index: number) => {
      const w2e = week2Exp[k][index];
      tableprint.push({
        Category: w2c.name,
        CatVal: w2c.value,
        Expense: w2e.name,
        ExpVal: w2e.value,
      });
    });
    console.log(stringTable.create(
      tableprint,
      {
        formatters: {
          CatVal: (v) => round2(v),
          ExpVal: (v) => round2(v),
        },

      },
    ));
    //    StringTable.create(tableprint);
    /*
    console.log('top 5 exps:');
    week2Exp[k].slice(0, 5).forEach((w2e: ExpenseEntity) => {
      console.log(`${w2e.name} --- ${w2e.value}`);
    });
*/
    console.log('---');
    console.log(' ');
  });

  return workload;
};

export const describeExpenses = (workload: Workload):Workload => ({
  ...workload,
  week2Descr: {
    '2022_35': 'Заказ нью Бэланс, покупка ножей домой',
    '2022_32': 'Поездка в польшу, ремонт телефона',
    '2022_31': 'Грузия билеты',
    '2022_30': 'ДР брата',
    '2022_29': 'Бассейн Olympia, Кредо, Платье Алене',
    '2022_28': 'Стройка дачи, Крипта, Бассейн Olympia',
    '2022_26': 'Брест',
    '2022_25': 'Кофемашина',
  },
});

export const consoleLog = (objs: []) => {
  console.log(JSON.stringify(objs));
  // objs.forEach((e) => { console.log(JSON.stringify(e)); });
};
export const sortByWeek = (entities: ExpenseEntity[]) => entities;
export const maxExpense = (entities: ExpenseEntity[]) => entities;

export const findPriorFile = () => {
  const dir = '/Users/viktor/Downloads/';
  const filtered = fs.readdirSync(dir).filter((value:string) => value.includes('Vpsk_') && value.includes('.csv'));
  const mtimes = filtered.map((filename) => ({
    filename,
    mtime: fs.statSync(`${dir}/${filename}`).mtime.getTime(),
  })).sort((a, b) => b.mtime - a.mtime);

  return mtimes.length ? mtimes[0].filename : null;
};
