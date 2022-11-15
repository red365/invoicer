import React, { FC, } from 'react';
import { InvoiceListComponentProps, Invoice } from '../types.js';
import _ from 'lodash';
var moment = require('moment-business-days');

const InvoiceList: FC<InvoiceListComponentProps> = (props) => {
  const { organiseByYear, pageOfInvoicesToDisplay, selectedYear, invoices } = props;

  const getRowMarkup = (invoice: Invoice, i: number) => {
    return (
      <div className="panel-item" key={i} >
        <div className="invoice-list-date">
          <strong>{moment(`${invoice.year}-${invoice.month < 10 ? `0${invoice.month}` : invoice.month}-01`).format("MMMM YYYY")}</strong>
        </div>
        <div className="invoice-list-buttons">
          <button className="btn invoice-list-button" onClick={() => props.editInvoice(invoice)} >Edit</button>
          <button className="btn invoice-list-button" onClick={() => props.viewInvoice(invoice)} >View</button>
          <button className="btn invoice-list-button" onClick={() => props.deleteInvoice(invoice)} >Delete</button>
        </div>
      </div>
    )
  }

  const generateListRows = (organiseByYear: boolean, pageOfInvoicesToDisplay: Invoice[], selectedYear: number, invoices: Invoice[]): JSX.Element[] | [] => {
    if (organiseByYear) {
      const filteredInvoices = invoices.filter((invoice: Invoice) => invoice.year == selectedYear);
      return filteredInvoices.map((invoice, i) => getRowMarkup(invoice, i));
    } else {
      return pageOfInvoicesToDisplay ? pageOfInvoicesToDisplay.map((invoice, i) => getRowMarkup(invoice, i)) : [];
    }
  }

  return (
    <div>
      {selectedYear || pageOfInvoicesToDisplay ? generateListRows(organiseByYear, pageOfInvoicesToDisplay, selectedYear, invoices) : null}
    </div>
  )
}

export default InvoiceList;