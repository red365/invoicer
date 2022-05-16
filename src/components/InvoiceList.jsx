import React, { Component } from 'react';
var moment = require('moment-business-days');
import Dropdown from '../components/Dropdown';


const InvoiceList = props => {
  const getRowMarkup = (invoice, i) => (
    <div className="panel-item" key={i} >
      <div className="invoice-list-date">
        <strong>{moment(`${invoice.year}-${invoice.month < 10 ? `0${invoice.month}`: invoice.month}-01`).format("MMMM YYYY")}</strong>
      </div>
      <div className="invoice-list-buttons">
        <button className="btn invoice-list-button" onClick={() => props.editInvoice(invoice) } >Edit</button>
        <button className="btn invoice-list-button" onClick={() => props.viewInvoice( invoice ) } >View</button>
        <button className="btn invoice-list-button" onClick={() => props.deleteInvoice( invoice ) } >Delete</button>
      </div>
    </div>
    )

  const generateListRows = (organiseByYear, pageOfInvoicesToDisplay, selectedYear, invoices) => {
      if (organiseByYear) {
        return invoices.filter(invoice => invoice.year == selectedYear).map( (invoice, i) => getRowMarkup(invoice, i));
      } else {
        return pageOfInvoicesToDisplay ? pageOfInvoicesToDisplay.map((invoice, i) => getRowMarkup(invoice, i)) : [];
      }
    }

  const {organiseByYear, pageOfInvoicesToDisplay, selectedYear, invoicesPerPage, invoices} = props;
  return (
    <div>
      { selectedYear || pageOfInvoicesToDisplay ? generateListRows(organiseByYear, pageOfInvoicesToDisplay, selectedYear, invoices) : null }
    </div>
  )
}

export default InvoiceList;