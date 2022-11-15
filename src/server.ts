import { CreateClientAddressQueryParams, InvoiceQueryParams, ClientAddressesQueryParams, InvoiceListQueryParams, AddressQueryParams, SaveInvoiceQueryParams, UpdateInvoiceQueryParams, DeleteInvoiceQueryParams, TimesheetEntries } from './types';
import { getDevEnvConfigPathObj, setupExpressHotUpdateMiddleware, getDevStaticFilesPath, getDevIndexFilePath } from './dev.config.js';
import { Request, Response, Express } from 'express';
import { getProdEnvConfigPathObj, getProdStaticFilesPath, getProdIndexFilePath } from './prod.config.js';
import CsvImporter from './utils/CsvImporter';

const path = require('path'),
  express = require('express'),
  formidable = require('express-formidable'),
  server: Express = express();

server.use(formidable());
const args = process.argv;
const dotenv = require('dotenv');
import DatabasePool from './utils/DatabasePool';
import DatabaseConnector from './utils/DatabaseConnector';

interface DotEnvConfig {
  path: string;
}

var staticFilesPath = "";
var indexFilePath = "";
var connection: any;
var test = "blah";

if (args[2] == '--mode' && args[3] == 'dev') {
  indexFilePath = getDevIndexFilePath();
  staticFilesPath = getDevStaticFilesPath();
  dotenv.config(getDevEnvConfigPathObj());
  setupExpressHotUpdateMiddleware(server);
  connection = new DatabaseConnector({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
} else {
  indexFilePath = getProdIndexFilePath();
  dotenv.config(getProdEnvConfigPathObj());
  staticFilesPath = getProdStaticFilesPath();
  connection = new DatabasePool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
}

server.use('/static', express.static(staticFilesPath));

const saveInvoice = (queryParams: SaveInvoiceQueryParams): Promise<any> => {
  const query = 'insert into invoices set year = ?, month = ?, rate = ?, date = ?, daysOff = ?, hours = ?, description = ?, csvFilename = ?, clientRef = ?, myAddressRef = ?'
  return connection.query(query, [queryParams.year, queryParams.month, queryParams.rate, queryParams.date, queryParams.daysOff, queryParams.hours, queryParams.description, queryParams.csvFilename, queryParams.clientRef, queryParams.myAddressRef]).then((results: any) => results, (err: any) => { throw err });
}

const updateInvoice = (queryParams: UpdateInvoiceQueryParams): Promise<any> => {
  const query = `update invoices set 
  year = ?, 
  month = ?, 
  rate = ?, 
  date = ?,
  daysOff = ?, 
  hours = ?, 
  description = ?, 
  csvFilename= ?, 
  clientRef = ?, 
  myAddressRef = ? 
  where id = ?`;

  const params = [
    queryParams.year,
    queryParams.month,
    queryParams.rate,
    queryParams.date,
    queryParams.daysOff,
    queryParams.hours,
    queryParams.description,
    queryParams.csvFilename,
    queryParams.clientRef,
    queryParams.myAddressRef,
    queryParams.id
  ]

  return connection.query(query, params).then((results: any) => results, (err: any) => { throw err });
}

const deleteInvoice = (queryParams: DeleteInvoiceQueryParams): Promise<any> => {
  return connection.query('delete from invoices where id = ?', [queryParams.invoiceId]).then((res: any) => res, (err: any) => { throw err });
}

const getInvoiceData = (queryParams: InvoiceQueryParams): Promise<any> => {
  const query = `
  select a.id, a.rate, a.year, a.month, a.date, a.hours, a.daysOff, a.description, a.csvFilename, a.clientRef, a.myAddressRef, d.name, c.addressLineOne, c.addressLineTwo, c.addressLineThree, c.addressLineFour, c.city, c.countyOrState, c.postOrZipCode
  from invoices as a
  inner join clientAddresses as b
  on a.clientRef = b.id
  inner join addresses as c
  on b.addressId = c.id
  inner join clients as d
  on b.clientId = d.id
  where a.id = ?
  `;

  return connection.query(query, [queryParams.invoiceId]).then((results: any) => {
    const { id, rate, year, month, date, hour, daysOff, description, csvFilename, clientRef, addressLineOne, addressLineTwo, addressLineThree, addressLineFour, city, postOrZipCode, countyOrState, name } = results[0];
    const responseObj = {
      invoice: {
        id,
        rate,
        year,
        month,
        date,
        hour,
        daysOff,
        description,
        csvFilename,
        clientRef
      },
      address: {
        addressLineOne,
        addressLineTwo,
        addressLineThree,
        addressLineFour,
        city,
        countyOrState,
        postOrZipCode,
      },
      client: {
        name
      }
    }
    return responseObj;
  }, (err: any) => { throw err });
}

const getBusinessAddresses = (): Promise<any> => {
  return connection.query('select * from addresses where isClientAddress = 0', []).then((results: any) => results, (err: any) => { throw err });
}

const getInvoiceList = (queryParams: InvoiceListQueryParams): Promise<any> => {
  const query = `select a.id, a.rate, a.year, a.month, a.date, a.hours, a.daysOff, a.description, a.csvFilename, a.clientRef, a.myAddressRef from invoices as a
  inner join clientAddresses as b
  on a.clientRef = b.id
  inner join clients as c
  on c.id = b.clientId
  where c.id = ?
  `
  return connection.query(query, [queryParams.id]).then((results: any) => results, (err: any) => { throw err });
}

const createClient = (clientName: string | string[]): Promise<any> => {
  return connection.query('insert into clients set name = ?', [clientName]).then((results: any) => results, (err: any) => { throw err });
}

const getClientAddresses = (queryParams: ClientAddressesQueryParams): Promise<any> => {
  return connection.query(`select a.name, b.id, b.clientId, c.addressLineOne, c.addressLineTwo, c.addressLineThree, c.addressLineFour, c.city, c.countyOrState, c.postOrZipCode
  from clients as a 
  inner join clientAddresses as b 
  on a.id = b.clientId 
  inner join addresses as c 
  on b.addressId = c.id
  where a.id = ?
  `, [queryParams.id]).then((results: any) => results, (err: any) => { throw err });
}

const getClients = (): Promise<any> => {
  return connection.query('select * from clients', []).then((results: any) => results, (err: any) => { throw err });
}

const createAddress = (address: AddressQueryParams): Promise<any> => {
  return connection.query('insert into addresses set addressLineOne = ?, addressLineTwo = ?, addressLineThree = ?, addressLineFour = ?, city = ?, countyOrState = ?, postOrZipCode = ?, isClientAddress = ?', [address.addressLineOne, address.addressLineTwo, address.addressLineThree, address.addressLineFour, address.city, address.countyOrState, address.postOrZipCode, address.isClientAddress]).then((results: any) => results, (err: any) => { throw err });
}

const createClientAddress = ({ clientId, addressId }: CreateClientAddressQueryParams): Promise<any> => {
  return connection.query('insert into clientAddresses set clientId = ?, addressId = ?', [clientId, addressId]).then((results: any) => results, (err: any) => { throw err });
}

const getCsvData = (csvFilename: string | string[]): any => {
  const noheader = false;
  const headerRow = ['day', 'date', 'project', 'task', 'time']
  const pathToCsvFile = path.join(__dirname, '..', 'timesheets', `${csvFilename}.csv`);
  return new CsvImporter(noheader, headerRow, pathToCsvFile).requestCsv();
}

// API

server.post('/get/csv', (request: Request, response: Response) => getCsvData(request.fields.csvFilename).then((jsonCsv: any) => response.json(jsonCsv)).catch((err: any) => console.log(err.stack)));

server.post('/create/client', (request: Request, response: Response, next: any) => {
  createClient(request.fields.clientName).catch(err => next(err)).then(results => {
    const address: any = request.fields.address;
    const clientId = results.insertId;
    request.fields.addAddress ?
      createAddress({ ...address, isClientAddress: true }).catch(err => next(err)).then(results => createClientAddress({ clientId, addressId: results.insertId }).then(results => response.status(200).json({ message: "Client and address added" })))
      : response.status(200).json({ message: "Client added" });
  });
})

// const requestDataTypeMapper = (requestBody: string | string[]) = {
//   return correctRequestBodyType;
// }

server.post('/create/address', (request: Request, response: Response, next: any) => createAddress({ ...request.fields.address as any, isClientAddress: request.fields.isClientAddress }).catch(err => next(err)).then(results => {
  const selectedClient = request.fields.selectedClient as any;
  request.fields.isClientAddress ? createClientAddress({ clientId: selectedClient.id, addressId: results.insertId }).then(results => response.status(200).json({ message: "Client address created" })) : response.status(200).json({ message: "Business address created" })
}));
server.post('/get/client-addresses', (request: Request, response: Response, next: any) => getClientAddresses(request.fields as any).catch(err => next(err)).then(results => response.json(results)));
server.post('/invoice-list', (request: Request, response: Response, next: any) => getInvoiceList(request.fields as unknown as InvoiceListQueryParams).catch(err => next(err)).then(results => response.json(results)));
server.post('/view-invoice', (request: Request, response: Response, next: any) => getInvoiceData(request.fields as unknown as InvoiceQueryParams).catch(err => next(err)).then(invoiceData => response.json(invoiceData)));
server.post('/delete/invoice', (request: Request, response: Response, next: any) => deleteInvoice(request.fields as any).catch(err => next(err)).then(results => response.json({ message: "Invoice deleted" })));
server.post('/update/invoice', (request: Request, response: Response, next: any) => updateInvoice(request.fields as any).catch(err => next(err)).then(results => response.json({ message: "Invoice updated" })));
server.post('/save/invoice', (request: Request, response: Response, next: any) => saveInvoice(request.fields as any).catch(err => next(err)).then(results => response.json({ message: "Invoice saved" })));
server.get('/get/clients', (request: Request, response: Response, next: any) => getClients().catch(err => next(err)).then(results => response.json(results)));
server.get('/get/business-details', (request: Request, response: Response) => response.json({ contactDetails: { businessName: process.env.BUSINESS_NAME, phone: process.env.PHONE, email: process.env.EMAIL } }));
server.get('/get/my-addresses', (request: Request, response: Response, next: any) => getBusinessAddresses().catch(err => next(err)).then(results => response.json(results)));
server.get('/*', (request: Request, response: Response) => response.sendFile(indexFilePath));

server.use((req: Request, res: Response, next: any) => {
  res.status(500).json({ message: 'Internal server error occurred' });
});

const serverAddress = process.env.SERVER_ADDRESS;
const port = parseInt(process.env.PORT);
server.listen(port, serverAddress);
console.log(`Serving at http://${serverAddress}:${port}`);
