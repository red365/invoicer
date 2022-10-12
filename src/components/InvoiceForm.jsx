import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import Dropdown from './Dropdown'
var moment = require('moment-business-days');


function InvoiceForm(props) {
  function initialiseForm() {
    return {
      year: '',
      monthWorked: '',
      daysOff: '',
      hourlyRate: '',
      invoiceDate: '',
      description: '',
      csvFilename: '',
      mySelectedAddress: '',
      selectedClientAddress: ''
    }
  }

  const [formParams, setFormParams] = useState(initialiseForm());
  const { year, monthWorked, daysOff, hourlyRate, invoiceDate, description, csvFilename, mySelectedAddress, selectedClientAddress } = formParams;
  const { clientAddresses, myAddresses, invoiceBeingEdited, refreshInvoiceList, closeForm, setNotificationConfig, handleErrors } = props;

  useEffect(() => {
    invoiceBeingEdited ? initialiseFormStateFromInvoice(invoiceBeingEdited) : null
  }, []);

  function submitButtonIsDisabled(clientAddresses, myAddresses) {
    return clientAddresses.length == 0 || myAddresses.length == 0;
  }

  function amountEarnedInMonth(year, monthWorked, daysOff, hourlyRate) {
    return hoursWorkedInMonth(year, monthWorked, daysOff) * parseFloat(hourlyRate);
  }

  function initialiseFormStateFromInvoice(invoiceBeingEdited) {
    const { year, month, daysOff, rate, date, description, csvFilename, myAddressRef, clientRef } = invoiceBeingEdited;
    setFormParams(prev => {
      const newParams = {
        year,
        monthWorked: month,
        daysOff,
        hourlyRate: rate,
        invoiceDate: moment(date).utc().format("DD[/]MM[/]YYYY"),
        description: description,
        csvFilename,
        mySelectedAddress: getAddressFromId(myAddressRef, "my address"),
        selectedClientAddress: getAddressFromId(clientRef, "client")
      };
      return { ...newParams };
    });
  }

  function daysInMonth(year, monthWorked) {
    return moment(`${year}-${formatMonth(monthWorked)}`, 'YYYY-MM').daysInMonth(year, monthWorked);
  }

  function getAddressFromId(value, addressType) {
    return addressType == "client" ? getSelectedClientAddress(value, clientAddresses) : getMySelectedAddress(value, myAddresses);
  }

  function generateTotalsTable(year, monthWorked, hourlyRate, daysOff) {
    return (
      <table className="table">
        <tbody>
          <tr><td>{`Days worked in ${monthWorkedAsString(year, monthWorked)} ${year}:`}</td><td>{daysWorkedInMonth(year, monthWorked, daysOff)}</td></tr>
          <tr><td>{`Hours worked in ${monthWorkedAsString(year, monthWorked)} ${year}:`}</td><td>{hoursWorkedInMonth(year, monthWorked, daysOff)}</td></tr>
          {hourlyRate ? <tr><td>{`Amount earned in ${monthWorkedAsString(year, monthWorked)} ${year}:`}</td><td>{`£${amountEarnedInMonth(year, monthWorked, daysOff, hourlyRate).toFixed(2)}`}</td></tr> : null}
        </tbody>
      </table>
    );
  }

  function monthWorkedAsString(year, monthWorked) {
    const date = new Date(parseInt(year), monthWorked - 1, 1);
    return date.toLocaleString('en-us', { month: 'long' });
  }

  function formatMonth(month) {
    return month < 10 ? `0${month}` : `${month}`;
  }

  function daysWorkedInMonth(year, monthWorked, daysOff) {
    return moment(`${getCurrentMonthDateString(year, monthWorked)}`, 'YYYY-MM-DD').businessDaysIntoMonth() - daysOff;
  }

  function hoursWorkedInMonth(year, monthWorked, daysOff) {
    return daysWorkedInMonth(year, monthWorked, daysOff) * 7.5;
  }

  function getCurrentMonthDateString(year, monthWorked) {
    return `${year}-${formatMonth(monthWorked)}-${daysInMonth(year, monthWorked)}`;
  }

  function addDatesToDescription(year, monthWorked, invoiceBeingEdited, description) {
    return invoiceBeingEdited ? description : `${description} from 01/${formatMonth(monthWorked)}/${year} to ${daysInMonth(year, monthWorked)}/${formatMonth(monthWorked)}/${year}`;
  }

  function onDropdownValueSelect(e) {
    const selectedAddress = e.target.name == "selectedClientAddress" ? getSelectedClientAddress(e.target.value, props.clientAddresses) : getMySelectedAddress(e.target.value, props.myAddresses);
    handleFormInput({ [e.target.name]: selectedAddress });
  }

  function generateRequestBody(invoiceBeingEdited, state) {
    const { year, monthWorked, hourlyRate, invoiceDate, daysOff, csvFilename, selectedClientAddress, mySelectedAddress, description } = state;
    const requestObject = {
      year,
      month: monthWorked,
      rate: hourlyRate,
      date: moment(invoiceDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      hours: hoursWorkedInMonth(year, monthWorked, daysOff),
      daysOff,
      description: addDatesToDescription(year, monthWorked, invoiceBeingEdited, description),
      csvFilename,
      clientRef: selectedClientAddress.id,
      myAddressRef: mySelectedAddress.id
    };

    const addIdToRequest = () => requestObject.id = invoiceBeingEdited.id;
    invoiceBeingEdited ? addIdToRequest() : null;

    return requestObject;
  }

  function getMySelectedAddress(value, myAddresses) {
    return myAddresses.find(address => value == address.id);
  }

  function getSelectedClientAddress(value, clientAddresses) {
    return clientAddresses.find(address => value == address.id);
  }

  function handleFormInput(newParams) {
    setFormParams(prev => {
      return { ...prev, ...newParams }
    });
  }

  function handleSubmit(e) {
    e.preventDefault()
    fetch(invoiceBeingEdited ? `/update/invoice` : `/save/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(generateRequestBody(invoiceBeingEdited, formParams)),
    })
      .then(res => handleErrors(res))
      .then(res => {
        setNotificationConfig({ message: res.message, style: "success" })
        refreshInvoiceList();
        closeForm();
      }).catch(err => setNotificationConfig({ message: "An error occurred. Please try again.", style: "error" }));
  }

  return (
    <form className="invoice-form" onSubmit={(e) => handleSubmit(e)} >
      <div className="form-field">
        <label>Year:</label>
        <input
          id="year"
          name="year"
          className="short-input"
          type="text"
          value={year}
          onChange={(e) => handleFormInput({ [e.target.name]: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label>Month Worked:</label>
        <input
          id="month-worked"
          name="monthWorked"
          className="short-input"
          type="number"
          value={monthWorked}
          onChange={(e) => handleFormInput({ [e.target.name]: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label>Days off:</label>
        <input
          id="days-off"
          name="daysOff"
          className="short-input"
          type="number"
          value={daysOff}
          onChange={(e) => handleFormInput({ [e.target.name]: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label>Hourly rate:</label>
        <input
          id="hourly-rate"
          name="hourlyRate"
          className="short-input"
          type="text"
          value={hourlyRate}
          onChange={(e) => handleFormInput({ [e.target.name]: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label>Invoice date:</label>
        <input
          id="date-input"
          name="invoiceDate"
          className=""
          type="text"
          value={invoiceDate}
          onChange={(e) => handleFormInput({ [e.target.name]: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label>Invoice description:</label>
        <input
          id="description"
          name="description"
          className="description-input"
          type="text"
          value={description}
          onChange={(e) => handleFormInput({ [e.target.name]: e.target.value })}
        />
      </div>
      <div className="form-field">
        <label>CSV file name:</label>
        <input
          id="filename-input"
          name="csvFilename"
          className="medium-input"
          type="text"
          value={csvFilename}
          onChange={(e) => handleFormInput({ [e.target.name]: e.target.value })}
        />
      </div>
      {clientAddresses.length > 0 ?
        <div className="form-dropdown">
          <label>Select the company address:</label>
          <Dropdown
            id="company-address-select"
            name="selectedClientAddress"
            propToUseAsItemText="addressLineTwo"
            dropdownItems={clientAddresses}
            changeHandler={onDropdownValueSelect}
            value={selectedClientAddress ? selectedClientAddress.id : ''}
          />
        </div> : <p>You need to have a client address set up before you can create an invoice</p>
      }
      {myAddresses.length > 0 ?
        <div className="form-dropdown">
          <label>Select your address:</label>
          <Dropdown
            id="my-address-select"
            name="mySelectedAddress"
            dropdownItems={myAddresses}
            changeHandler={onDropdownValueSelect}
            propToUseAsItemText="postOrZipCode"
            value={mySelectedAddress ? mySelectedAddress.id : ''}
          />
        </div> : <p>You need to have an employee address set up before you can create an invoice</p>
      }
      <div>
        {year && monthWorked && daysOff ? generateTotalsTable(year, monthWorked, hourlyRate, daysOff) : null}
      </div>
      <div className="button-container">
        <button type="submit" className="btn btn-primary" style={submitButtonIsDisabled(clientAddresses, myAddresses) ? { backgroundColor: "#999" } : null} disabled={submitButtonIsDisabled(clientAddresses, myAddresses)}>{invoiceBeingEdited ? 'Update' : 'Save'}</button>
        <button type="button" className="invoice-list-button btn" onClick={closeForm}>Back</button>
      </div>

    </form>
  )
}

export default withRouter(InvoiceForm);