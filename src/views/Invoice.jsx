import React, { useEffect, useState } from 'react';
import '../css/invoice.css';
var moment = require('moment-business-days');

function Invoice(props) {
  const [timesheetEntries, setTimesheetEntries] = useState(undefined);
  const { invoice, client, clientAddress, businessAddress, contactDetails } = props.location.state;

  useEffect(() => {
    fetch(`/get/csv`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        csvFilename: props.location.state.invoice.csvFilename
      }),
    }).then(res => res.json()).then(res => {

      // Filter header row
      const filteredTimesheet = res.filter(row => row.task != '' && row.task != "Work Description")
      setTimesheetEntries(filteredTimesheet);
    });
  }, [])


  function getTotalInvoiceAmount(rate, hours) {
    return parseFloat(rate * hours).toFixed(2);
  }

  return (
    <section id="page" size="A4">
      <header className="header">
        {businessAddress ? <BusinessAddress address={businessAddress} contactDetails={contactDetails} /> : null}
        <h3 className="invoice-heading">Invoice</h3>
      </header>

      <hr />

      <h6 className="inline">Bill To:</h6>
      {clientAddress ? <ClientAddress className="invoice-heading" address={clientAddress} client={client} /> : null}

      <div className="invoice-date">
        <h6 className="invoice-heading">Date:</h6><label className="invoice-heading date-text">{invoice ? moment(invoice.date, 'YYYY/MM/DD').format('DD/MM/YYYY') : null}</label>
      </div>

      {invoice ? <InvoiceSummary timesheetEntries={timesheetEntries} invoice={invoice} getInvoiceAmount={getTotalInvoiceAmount} /> : null}
    </section>
  )
}

const InvoiceSummary = props => {
  return (
    <div className="invoice-summary">
      <SummaryTable
        description={props.invoice.description}
        hours={props.invoice.hours}
        price={props.invoice.rate}
        amount={props.getInvoiceAmount(props.invoice.rate, props.invoice.hours)}
      />
      <TotalTable amount={props.getInvoiceAmount(props.invoice.rate, props.invoice.hours)} />
      {
        props.timesheetEntries ? (
          <div>
            <h6>Itemised Billing:</h6>
            <ItemisedTable
              timesheetEntries={props.timesheetEntries}
            />
          </div>
        ) : null
      }
    </div>
  )
}

const BusinessAddress = props => {
  return (
    <div className="businessAddressPanel">
      <label className="business-name" >{props.contactDetails.businessName}</label>
      <label>{props.address.addressLineOne}</label>
      {props.address ? <div><label>{props.address.addressLineTwo}</label></div> : null}
      <label>{props.address.city}</label>
      <label className="last-label-of-block">{props.address.postOrZipCode}</label>
      {props.contactDetails.phone ? <div><label>{props.contactDetails.phone}</label></div> : null}
      {props.contactDetails.email ? <div><label>{props.contactDetails.email}</label></div> : null}
    </div>
  )

}

const ClientAddress = props => {
  return (
    <div>
      {props.client ?
        <div className="clientAddressPanel">
          <label>{props.client.name}</label>
          <label>{props.address.addressLineOne}</label>
          <label>{props.address.addressLineTwo}</label>
          <label>{props.address.addressLineThree}</label>
          {props.address.addressLineFour ? <div><label>{props.address.countyOrState}</label></div> : null}
          <label>{props.address.city}</label>
          {props.address.countyOrState ? <div><label>{props.client.countyOrState}</label></div> : null}
          <label>{props.address.postOrZipCode}</label>
        </div>
        : null
      }
    </div>
  )
}

const SummaryTable = props => {
  return (
    <table className="table table-borderless">
      <thead>
        <tr>
          <th>Description</th>
          <th className="small-table-cell">Hours</th>
          <th className="small-table-cell">Unit Price</th>
          <th className="small-table-cell">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{props.description}</td>
          <td className="small-table-cell">{props.quantity}</td>
          <td className="small-table-cell">£{props.price}</td>
          <td className="small-table-cell">{`£${props.amount}`}</td>
        </tr>
      </tbody>
    </table>
  )
}

const TotalTable = props => {

  return (
    <table className="table table-borderless" >
      <tbody>
        <tr>
          <td colSpan="2"></td>
          <td className="small-table-cell border-bottom" ><strong>Total</strong></td>
          <td className="small-table-cell border-bottom" >{`£${props.amount}`}</td>
        </tr>
      </tbody>
    </table>
  )
}

const ItemisedTable = props => {
  return (
    <table className="table table-borderless">
      <thead>
        <tr>
          <th>Day</th>
          <th>Date</th>
          <th>Project</th>
          <th>Task</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {
          props.timesheetEntries.map((row, i) => {
            return (
              <tr key={i}>
                <td>{row.day}</td>
                <td>{row.date}</td>
                <td>{row.project}</td>
                <td>{row.task}</td>
                <td>{row.time}</td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
  )
}

export default Invoice;