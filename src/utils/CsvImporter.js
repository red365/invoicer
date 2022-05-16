const csv = require('csvtojson')

class CsvImporter {

  constructor (noheader, headerRow=[], path) {
    this.headerRow = headerRow;
    this.noheader = noheader;
    this.path = path;
  }

  requestCsv = () => {
    return csv({ headers: this.headerRow, noheader: this.noheader }).fromFile( this.path );  
  }
}

module.exports = CsvImporter;