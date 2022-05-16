import React from 'react'
import { withRouter } from 'react-router-dom';
import Dropdown from './Dropdown'
var moment = require('moment-business-days');

class InvoiceForm extends React.Component {

  state = {
    year: '',
    monthWorked: '',
    daysOff: '',
    hourlyRate: '',
    invoiceDate: '',
    invoiceDescription: '',
    csvFilename: '',
  }

  formatMonth = month => month < 10 ? `0${month}` : `${month}`;

  handleFormInput = e => {
    this.setState({ [e.target.name]: e.target.value });
  }

  initialiseFormStateFromInvoice = invoiceBeingEdited => {
    const { year, month, daysOff, rate, date, description, csvFilename, myAddressRef, clientRef } = invoiceBeingEdited;

    this.setState({ 
      year,
      monthWorked: month,
      daysOff,
      hourlyRate: rate,
      invoiceDate: moment(date).format("DD[/]MM[/]YYYY"),
      invoiceDescription: description,
      csvFilename,
      mySelectedAddress: this.getAddressFromId(invoiceBeingEdited.myAddressRef, "my address"),
      selectedClientAddress: this.getAddressFromId(invoiceBeingEdited.clientRef, "client")
    })
  }

  amountEarnedInMonth = (year, monthWorked, daysOff, hourlyRate) => this.hoursWorkedInMonth(year, monthWorked, daysOff) * parseFloat(hourlyRate);

  monthWorkedAsString = (year, monthWorked) => {
    const date = new Date(parseInt(year), monthWorked - 1, 1); 
    return date.toLocaleString('en-us', { month: 'long' });
  }

  componentDidMount = () => this.props.invoiceBeingEdited ? this.initialiseFormStateFromInvoice(this.props.invoiceBeingEdited, this.props.myAddresses) : null;

  onDropdownValueSelect = (e) => {
    const selectedAddress = e.target.name == "selectedClientAddress" ? this.getSelectedClientAddress(e.target.value, this.props.clientAddresses) : this.getMySelectedAddress(e.target.value, this.props.myAddresses);
    this.setState({ [e.target.name]: selectedAddress }); 
  }

  getMySelectedAddress = (value, myAddresses) => myAddresses.find(address => value == address.id);

  getSelectedClientAddress = (value, clientAddresses) => clientAddresses.find(address => value == address.id);

  getAddressFromId = (value, addressType) => addressType == "client" ? this.getSelectedClientAddress(value, this.props.clientAddresses) : this.getMySelectedAddress(value, this.props.myAddresses);

  handleSubmit = (e, invoiceBeingEdited, state, refreshInvoiceList, closeForm, updateStatusBarMessage) => {
    e.preventDefault()
    fetch( invoiceBeingEdited ? `/update/invoice` : `/save/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify( this.generateRequestBody(invoiceBeingEdited, state) ),
    })
    .then(res => this.props.handleErrors(res))
    .then( res => {
      updateStatusBarMessage(res.message)
      refreshInvoiceList();
      closeForm();
    }).catch(err => this.props.updateStatusBarMessage("An error occurred. Please try again."));
  }

  generateRequestBody = (invoiceBeingEdited, state) => {
    const {year, monthWorked, hourlyRate, invoiceDate, daysOff, csvFilename, selectedClientAddress, mySelectedAddress, description } = state;
    const requestObject = {
      year,
      month: monthWorked,
      rate: hourlyRate,
      date: moment(invoiceDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
      hours: this.hoursWorkedInMonth(year, monthWorked, daysOff),
      daysOff,
      description: this.addDatesToDescription(year, monthWorked, invoiceBeingEdited, description ),
      csvFilename,
      clientRef: selectedClientAddress.id,
      myAddressRef: mySelectedAddress.id
    };

    const addIdToRequest = () => requestObject.id = invoiceBeingEdited.id;
    invoiceBeingEdited ? addIdToRequest() : null;

    return requestObject;
  }

  getCurrentMonthDateString = (year, monthWorked) => `${year}-${this.formatMonth(monthWorked)}-${this.daysInMonth(year, monthWorked)}`;

  daysInMonth = (year, monthWorked) => moment(`${year}-${this.formatMonth(monthWorked)}`, 'YYYY-MM').daysInMonth(year, monthWorked);

  daysWorkedInMonth = (year, monthWorked, daysOff) => moment( `${this.getCurrentMonthDateString(year, monthWorked)}`, 'YYYY-MM-DD' ).businessDaysIntoMonth() - daysOff;

  hoursWorkedInMonth = (year, monthWorked, daysOff) => this.daysWorkedInMonth(year, monthWorked, daysOff) * 7.5;

  addDatesToDescription = (year, monthWorked, invoiceBeingEdited, description) => invoiceBeingEdited ? description : `${description} from 01/${this.formatMonth( monthWorked)}/${year} to ${this.daysInMonth(year, monthWorked)}/${this.formatMonth( monthWorked)}/${year}`;

  generateTotalsTable = (year, monthWorked, hourlyRate, daysOff) => {
    return (
      <table className="table">
        <tbody>
          <tr><td>{`Days worked in ${this.monthWorkedAsString(year, monthWorked)} ${year}:`}</td><td>{this.daysWorkedInMonth(year, monthWorked, daysOff)}</td></tr>
          <tr><td>{`Hours worked in ${this.monthWorkedAsString(year, monthWorked)} ${year}:`}</td><td>{this.hoursWorkedInMonth(year, monthWorked, daysOff)}</td></tr>
          { hourlyRate ? <tr><td>{`Amount earned in ${this.monthWorkedAsString(year, monthWorked)} ${year}:`}</td><td>{`£${this.amountEarnedInMonth(year, monthWorked, daysOff, hourlyRate).toFixed(2)}`}</td></tr> : null }
        </tbody> 
      </table>
    );
  }

  submitButtonIsDisabled = (clientAddresses, myAddresses) => clientAddresses.length == 0 || myAddresses.length == 0;

  render() {
    const {year, monthWorked, hourlyRate, daysOff, invoiceDate, description, csvFilename, selectedClientAddress} = this.state;
    const {clientAddresses, myAddresses, invoiceBeingEdited, refreshInvoiceList, closeForm, updateStatusBarMessage} = this.props;

    return (
      <form className="invoice-form" onSubmit={(e) => this.handleSubmit(e, invoiceBeingEdited, this.state, refreshInvoiceList, closeForm, updateStatusBarMessage)} >
        <div className="form-field">
          <label>Year:</label> 
          <input 
            id="year"
            name="year"
            className="short-input" 
            type="text"
            value={year}
            onChange={(e) => this.handleFormInput(e)}
          />
        </div>
        <div className="form-field">
          <label>Month Worked:</label> 
          <input 
            id="month-worked"
            name="monthWorked"
            className="short-input" 
            type="number"
            value={monthWorked || ''}
            onChange={(e) => this.handleFormInput(e)}
          />
        </div>
        <div className="form-field">
          <label>Days off:</label> 
          <input 
            id="days-off" 
            name="daysOff"
            className="short-input"
            type="number"
            value={daysOff || ''}
            onChange={(e) => this.handleFormInput(e)} 
          />
        </div>
        <div className="form-field">
          <label>Hourly rate:</label>
          <input 
            id="hourly-rate" 
            name="hourlyRate"
            className="short-input"
            type="text" 
            value={hourlyRate || ''} 
            onChange={(e) => this.handleFormInput(e)} 
          />
        </div>
        <div className="form-field">
          <label>Invoice date:</label>
          <input 
            id="date-input"
            name="invoiceDate" 
            className="" 
            type="text"
            value={invoiceDate || ''} 
            onChange={(e) => this.handleFormInput(e)} 
          />
        </div>
        <div className="form-field">
          <label>Invoice description:</label> 
          <input 
            id="description"
            name="description" 
            className="description-input" 
            type="text"
            value={description || '' }
            onChange={(e) => this.handleFormInput(e)} 
          />
        </div>
        <div className="form-field">
          <label>CSV file name:</label> 
          <input 
            id="filename-input"
            name="csvFilename"
            className="medium-input"
            type="text" 
            value={ csvFilename || ''}
            onChange={(e) => this.handleFormInput(e)} 
          />
        </div>
        { clientAddresses.length > 0 ?
        <div className="form-dropdown">
          <label>Select the company address:</label> 
          <Dropdown 
            id="company-address-select"
            name="selectedClientAddress"
            propToUseAsItemText="addressLineTwo"
            dropdownItems={clientAddresses}
            changeHandler={this.onDropdownValueSelect}
            value={selectedClientAddress ? selectedClientAddress.id : '' }
          />
        </div> : <p>You need to have a client address set up before you can create an invoice</p>
        }
        { myAddresses.length > 0 ?
          <div className="form-dropdown">
            <label>Select your address:</label> 
            <Dropdown
              id="my-address-select"
              name="mySelectedAddress"
              dropdownItems={this.props.myAddresses}
              changeHandler={this.onDropdownValueSelect}
              propToUseAsItemText="postOrZipCode"
              value={this.state.mySelectedAddress ? this.state.mySelectedAddress.id : '' }
            />
          </div> : <p>You need to have an employee address set up before you can create an invoice</p>
        }
        <div>
          { year && monthWorked && daysOff ? this.generateTotalsTable(year, monthWorked, hourlyRate, daysOff) : null }
        </div>
        <div className="button-container">
          <button type="submit" className="btn btn-primary" style={this.submitButtonIsDisabled(clientAddresses, myAddresses) ? { backgroundColor: "#999" } : null} disabled={this.submitButtonIsDisabled(clientAddresses, myAddresses)}>{ invoiceBeingEdited ? 'Update' : 'Save' }</button>
          <button type="button" className="invoice-list-button btn" onClick={closeForm}>Back</button>
        </div>
        
      </form>
    )
  }
}

export default withRouter(InvoiceForm);