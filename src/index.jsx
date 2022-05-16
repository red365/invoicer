import React from 'react';
import ReactDOM from 'react-dom';
// import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Invoice from './views/Invoice';
import Invoices from './views/Invoices';
import ViewContainer from './views/ViewContainer'
import './css/invoice.css';
import './css/invoiceForm.css';
import './css/main.css';
import './css/header.css';

ReactDOM.render(<ViewContainer />, document.getElementById('app'));
