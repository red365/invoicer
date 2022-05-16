import express from 'express';
import path from 'path';
import { getProdEnvConfigPathObj, getProdStaticFilesPath, getProdIndexFilePath } from './prod.config';
import {getDevStaticFilesPath, getDevEnvConfigPathObj, getDevIndexFilePath, setupExpressHotUpdateMiddleware} from './dev.config';
import CsvImporter from './utils/CsvImporter';
import dotenv from 'dotenv';
import DatabasePool from './utils/DatabasePool';
import DatabaseConnector from './utils/DatabaseConnector';
const formidable = require('express-formidable');

const server = express();
server.use(formidable());

const args = process.argv;

var staticFilesPath = "";
var indexFilePath = "";
var connection = "";

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

function saveInvoice(queryParams) {
  const query = 'insert into invoices set year = ?, month = ?, rate = ?, date = ?, daysOff = ?, hours = ?, description = ?, csvFilename = ?, clientRef = ?, myAddressRef = ?'
  return connection.query(query, [queryParams.year, queryParams.month, queryParams.rate, queryParams.date, queryParams.daysOff, queryParams.hours, queryParams.description, queryParams.csvFilename, queryParams.clientRef, queryParams.myAddressRef]).then( results => results, err => { throw err });
}

function updateInvoice(queryParams) {
  const query = `update invoices set 
  year = ?, 
  month = ?, 
  rate = ?, 
  date = "?",
  daysOff = ?, 
  hours = ?, 
  description = "?", 
  csvFilename= "?", 
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

  return connection.query(query, params).then(results => results, err => {throw err});
}

function deleteInvoice(queryParams) {
  return connection.query('delete from invoices where id = ?', [queryParams.invoiceId]).then(res => res, err => {throw err});
}

function getInvoiceData(queryParams) {
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

  return connection.query(query, [queryParams.invoiceId]).then(results => {
    const {id, rate, year, month, date, hour, daysOff, description, csvFilename, clientRef, addressLineOne, addressLineTwo, addressLineThree, addressLineFour, city, postOrZipCode, countyOrState, name} = results[0]; 
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
  }, err => {throw err});
}

function getBusinessAddresses() {
  return connection.query('select * from addresses where isClientAddress = 0').then( results => results, err => { throw err });
}

function getInvoiceList(queryParams) {
  const query = `select a.id, a.rate, a.year, a.month, a.date, a.hours, a.daysOff, a.description, a.csvFilename, a.clientRef, a.myAddressRef from invoices as a
  inner join clientAddresses as b
  on a.clientRef = b.id
  inner join clients as c
  on c.id = b.clientId
  where c.id = ?
  `
  return connection.query(query, [queryParams.id]).then(results => results, err => {throw err });
}

function createClient(queryParams) {
  return connection.query('insert into clients set name = ?', [queryParams.clientName]).then(results => results);
}

function getClientAddresses(queryParams) {
  return connection.query(`select a.name, b.id, b.clientId, c.addressLineOne, c.addressLineTwo, c.addressLineThree, c.addressLineFour, c.city, c.countyOrState, c.postOrZipCode
  from clients as a 
  inner join clientAddresses as b 
  on a.id = b.clientId 
  inner join addresses as c 
  on b.addressId = c.id
  where a.id = ?
  `, [queryParams.id]).then( results => results, err => { throw err });
}

function getClients() {
  return connection.query('select * from clients').then(results => results, err => {throw err});
}

function createAddress(address) {
  return connection.query('insert into addresses set addressLineOne = ?, addressLineTwo = ?, addressLineThree = ?, addressLineFour = ?, city = ?, countyOrState = ?, postOrZipCode = ?, isClientAddress = ?', [address.addressLineOne, address.addressLineTwo, address.addressLineThree, address.addressLineFour, address.city, address.countyOrState, address.postOrZipCode, address.isClientAddress]).then(results => results, err => { throw err });
}

function createClientAddress(clientId, addressId) {
  return connection.query('insert into clientAddresses set clientId = ?, addressId = ?', [clientId, addressId]).then(results => results, err => {throw err});
}

function getCsvData(params) {
  const noheader = false;
  const headerRow = ['day','date','project','task','time']
  const pathToCsvFile = path.join(__dirname, '..', 'timesheets', `${params.csvFilename}.csv` );
  return new CsvImporter(noheader, headerRow, pathToCsvFile).requestCsv();
}

// API

server.post('/get/csv', (request, response) => getCsvData(request.fields).then(jsonCsv => response.json( jsonCsv )).catch(err => console.log(err.stack)));

server.post('/create/client', ( request, response, next) => {
  let clientId = '';
  createClient(request.fields).catch(err => next(err)).then(results => {
    clientId = results.insertId;
    request.fields.addAddress ? 
      createAddress({...queryParams, isClientAddress: true}).catch(err => next(err)).then(results => createClientAddress(clientId, results.insertId).then(results => response.status(200).json({ message: "Client and address added" }))) 
      : response.status(200).json({ message: "Client added" });
    });
})

server.post('/create/address', ( request, response, next) => createAddress(request.fields).catch(err => next(err)).then(results => request.fields.isClientAddress ? createClientAddress(request.fields.selectedClient.id, results.insertId ).then(results => response.status(200).json({ message: "Client address created"})) : response.status(200).json({ message: "Business address created"})));
server.post('/get/client-addresses', (request, response, next) => getClientAddresses(request.fields).catch(err => next(err)).then(results => response.json(results)));
server.post('/invoice-list', (request, response, next) => getInvoiceList(request.fields).catch(err => next(err)).then(results => response.json(results)) );
server.post('/view-invoice', (request, response, next) => getInvoiceData(request.fields).catch(err => next(err)).then(invoiceData => response.json(invoiceData)));
server.post('/delete/invoice', (request, response, next) => deleteInvoice(request.fields).catch(err => next(err)).then(results => response.json({ message: "Invoice deleted" })));
server.post('/update/invoice', (request, response, next) => updateInvoice(request.fields).catch(err => next(err)).then(results => response.json({ message: "Invoice updated"})));
server.post('/save/invoice', (request, response, next) => saveInvoice(request.fields).catch(err => next(err)).then(results => response.json({ message: "Invoice saved"})));
server.get('/get/clients', (request, response, next) => getClients(request.fields).catch(err => next(err)).then(results => response.json(results)));
server.get('/get/business-details', (request, response) => response.json({ contactDetails: { businessName: process.env.BUSINESS_NAME, phone: process.env.PHONE, email: process.env.EMAIL }}));
server.get('/get/my-addresses', (request, response, next) => getBusinessAddresses().catch(err => next(err)).then(results => response.json(results)));
server.get('/*', (request, response) => response.sendFile( indexFilePath ));

server.use((err, req, res, next) => {
  console.log(err.stack)
  return res.status(500).json({ message: 'Internal server error occurred' });
});


const serverAddress = process.env.SERVER_ADDRESS;
const port = process.env.PORT;
server.listen(port, serverAddress );
console.log(`Serving at http://${serverAddress}:${port}`);





