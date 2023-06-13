import * as fs from 'fs';
import { Iconv } from 'iconv';
import { parse } from 'csv-parse';
import { DateTime } from 'luxon';

import { parseDouble, ExpenseEntity, pipe } from './utils';
import {
  createWorkload, describeExpenses, findPriorFile,
  maxExpenses, myGroupByWeek, printMax, roundEntities, sortByDateDesc,
} from './handlers';

type CsvEntry={
  date: string;
  name: string;
  summ: string;
  currency: string;
  opDate: string;
  comm: string;
  value: string;
  none: string;
  category: string;
}

const entities: ExpenseEntity[] = [];

function decode(content) {
  const iconv = new Iconv('CP1251', 'UTF-8');
  const buffer = iconv.convert(content);
  return buffer.toString('utf8');
}

function bootstrap(): void {
  console.log(findPriorFile());
  return;
  const rr = decode(fs.readFileSync('/Users/viktor/Downloads/Vpsk_70261715-3.csv'));

  const headers = ['date', 'name', 'summ', 'currency', 'opDate', 'comm', 'value', 'none', 'category'];
  parse(rr, {
    delimiter: ';', columns: headers, relaxColumnCount: true, quote: false, trim: true,
  }, (err, records: CsvEntry[]) => {
    records.forEach((record) => {
      if (!record.date) return;
      const date = DateTime.fromFormat(record.date.split(' ')[0], 'dd.MM.yyyy');
      const value = parseDouble(record.value);
      if (!date.isValid || !value) return;

      // console.log(record.opDate);
      const i = {
        date,
        category: record.category,
        value,
        name: record.name,
      };

      entities.push(i);
    });

    pipe(
      createWorkload,
      roundEntities,
      sortByDateDesc,
      myGroupByWeek,
      describeExpenses,
      maxExpenses,
      printMax,
    )(entities);
  });
}

bootstrap();
