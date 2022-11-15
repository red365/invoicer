import React, { useState, useEffect, FC, ChangeEvent, FormEvent } from 'react';
import {
  InvoiceFormComponentProps,
  Invoice,
  Client,
  MyAddress,
  ClientAddress,
  InvoiceToBeSaved,
  UpdatedInVoiceFormParms,
  UnsavedInvoice
} from '../types';
import Dropdown from './Dropdown'
var moment = require('moment-business-days');


const InvoiceForm: FC<InvoiceFormComponentProps> = (props) => {
  const initialiseForm = (): UnsavedInvoice => {
    return {
      year: undefined,
      monthWorked: undefined,
      daysOff: undefined,
      hourlyRate: undefined,
      invoiceDate: '',
      description: '',
      csvFilename: '',
      mySelectedAddress: undefined,
      selectedClientAddress: undefined
    }
  }

  const [formParams, setFormParams] = useState<UnsavedInvoice>(initialiseForm());
  const { year, monthWorked, daysOff, hourlyRate, invoiceDate, description, csvFilename, mySelectedAddress, selectedClientAddress } = formParams;
  const { clientAddresses, myAddresses, invoiceBeingEdited, refreshInvoiceList, closeForm, setNotificationConfig, handleErrors } = props;

  useEffect(() => {
    invoiceBeingEdited ? initialiseFormStateFromInvoice(invoiceBeingEdited) : null
  }, []);

  const submitButtonIsDisabled = (clientAddresses: Client[], myAddresses: MyAddress[]): boolean => {
    return Boolean(clientAddresses.length == 0 || myAddresses.length == 0);
  }

  const amountEarnedInMonth = (year: number, monthWorked: number, daysOff: number, hourlyRate: number): number => {
    return hoursWorkedInMonth(year, monthWorked, daysOff) * parseFloat(hourlyRate.toString());
  }

  const initialiseFormStateFromInvoice = (invoiceBeingEdited: Invoice) => {
    const { year, month, daysOff, rate, date, description, csvFilename, myAddressRef, clientRef } = invoiceBeingEdited;
    setFormParams((prevState: UnsavedInvoice) => {
      const newParams = {
        year,
        monthWorked: month,
        daysOff,
        hourlyRate: rate,
        invoiceDate: moment(date).utc().format("DD[/]MM[/]YYYY"),
        description: description,
        csvFilename,
        mySelectedAddress: getAddressFromId(myAddressRef, "my address") as MyAddress,
        selectedClientAddress: getAddressFromId(clientRef, "client") as ClientAddress
      };
      return { ...prevState, ...newParams };
    });
  }

  const daysInMonth = (year: number, monthWorked: number): number => {
    return moment(`${year}-${formatMonth(monthWorked)}`, 'YYYY-MM').daysInMonth(year, monthWorked);
  }

  const getAddressFromId = (value: number, addressType: string): MyAddress | ClientAddress => {
    return addressType == "client" ? getSelectedClientAddress(value, clientAddresses) : getMySelectedAddress(value, myAddresses);
  }

  const generateTotalsTable = (year: number, monthWorked: number, hourlyRate: number | undefined, daysOff: number): JSX.Element => {
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

  const monthWorkedAsString = (year: number, monthWorked: number): string => {
    const date = new Date(year, monthWorked - 1, 1);
    return date.toLocaleString('en-us', { month: 'long' });
  }

  const formatMonth = (month: number): string => {
    return month < 10 ? `0${month}` : `${month}`;
  }

  const daysWorkedInMonth = (year: number, monthWorked: number, daysOff: number): number => {
    return moment(`${getCurrentMonthDateString(year, monthWorked)}`, 'YYYY-MM-DD').businessDaysIntoMonth() - daysOff;
  }

  const hoursWorkedInMonth = (year: number, monthWorked: number, daysOff: number): number => {
    return daysWorkedInMonth(year, monthWorked, daysOff) * 7.5;
  }

  const getCurrentMonthDateString = (year: number, monthWorked: number): string => {
    return `${year}-${formatMonth(monthWorked)}-${daysInMonth(year, monthWorked)}`;
  }

  const addDatesToDescription = (year: number, monthWorked: number, invoiceBeingEdited: Invoice, description: string): string => {
    return invoiceBeingEdited ? description : `${description} from 01/${formatMonth(monthWorked)}/${year} to ${daysInMonth(year, monthWorked)}/${formatMonth(monthWorked)}/${year}`;
  }

  const onDropdownValueSelect = (e: ChangeEvent<HTMLSelectElement>): void => {
    const selectedAddress = e.target.name == "selectedClientAddress" ? getSelectedClientAddress(parseInt(e.target.value), props.clientAddresses) : getMySelectedAddress(parseInt(e.target.value), props.myAddresses);
    handleFormInput({ [e.target.name]: selectedAddress });
  }

  const generateRequestBody = (invoiceBeingEdited: Invoice, unsavedInvoice: UnsavedInvoice): InvoiceToBeSaved => {
    const { year, monthWorked, hourlyRate, invoiceDate, daysOff, csvFilename, description } = unsavedInvoice;
    const selectedClientAddress = unsavedInvoice.selectedClientAddress!;
    const mySelectedAddress = unsavedInvoice.mySelectedAddress!;
    const requestObject: InvoiceToBeSaved = {
      year: year!,
      month: monthWorked!,
      rate: hourlyRate!,
      date: moment(invoiceDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      hours: hoursWorkedInMonth(year!, monthWorked!, daysOff!),
      daysOff: daysOff!,
      description: addDatesToDescription(year!, monthWorked!, invoiceBeingEdited, description),
      csvFilename,
      clientRef: selectedClientAddress.id,
      myAddressRef: mySelectedAddress.id
    };

    const addIdToRequest = () => requestObject.id = invoiceBeingEdited.id;
    invoiceBeingEdited ? addIdToRequest() : null;

    return requestObject;
  }

  const getMySelectedAddress = (value: number, myAddresses: MyAddress[]): MyAddress => {
    return myAddresses.find((address: MyAddress) => value == address.id) as MyAddress;
  }

  const getSelectedClientAddress = (value: number, clientAddresses: ClientAddress[]): ClientAddress => {
    return clientAddresses.find((address: ClientAddress) => value == address.id) as ClientAddress;
  }

  const handleFormInput = (newParams: UpdatedInVoiceFormParms): void => {
    setFormParams(prev => {
      return { ...prev, ...newParams }
    });
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    fetch(invoiceBeingEdited ? `/update/invoice` : `/save/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(generateRequestBody(invoiceBeingEdited!, formParams)),
    })
      .then((res: any) => handleErrors(res))
      .then((res: any) => {
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
        <button type="submit" className="btn btn-primary" style={submitButtonIsDisabled(clientAddresses, myAddresses) ? { backgroundColor: "#999" } : undefined} disabled={submitButtonIsDisabled(clientAddresses, myAddresses)}>{invoiceBeingEdited ? 'Update' : 'Save'}</button>
        <button type="button" className="invoice-list-button btn" onClick={closeForm}>Back</button>
      </div>

    </form>
  )
}

export default InvoiceForm;