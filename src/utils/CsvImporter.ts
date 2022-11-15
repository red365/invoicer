const csv = require('csvtojson');
import { TimesheetEntries } from '../types';

class CsvImporter {
  headerRow: string[];
  noheader: boolean;
  path: string;

  constructor(noheader: boolean, headerRow: string[] | [] = [], path: string) {
    this.headerRow = headerRow;
    this.noheader = noheader;
    this.path = path;
  }

  requestCsv = (): any => {
    return csv({ headers: this.headerRow, noheader: this.noheader }).fromFile(this.path);
  }
}

export default CsvImporter;