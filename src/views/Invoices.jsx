import React from 'react';
import { withRouter } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import Dropdown from '../components/Dropdown';
import InvoiceList from '../components/InvoiceList';
import PaginationLinks from '../components/PaginationLinks';
import InvoiceListControls from '../components/InvoiceListControls';
import StatusBar from '../components/StatusBar';
import statusBarTransition from '../utils/statusBarTransition';

class Invoices extends React.Component {

  state = {
    invoiceCurrentlyBeingEdited: undefined,
    selectedClient: undefined,
    displayInvoiceForm: false,
    organiseByYear: true,
    selectedYear: undefined, 
    invoicesPerPage: '',
    pageOfInvoicesToDisplay: undefined,
    statusMessage: ''
  }

  viewInvoice = invoice => {
    this.props.history.push(
      { pathname: '/view-invoice', 
        state: {
          invoice: invoice, 
          clientAddress: this.getItemFromList(invoice.clientRef, this.state.clientAddresses), 
          businessAddress: this.getItemFromList(invoice.myAddressRef, this.props.myAddresses), 
          contactDetails: this.props.contactDetails,
          client: this.state.selectedClient
        }
    });
  }

  handleErrors = response => {
    if (response.ok) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  } 

  fetchDeleteInvoice = invoice => this.props.fetch({ url: `/delete/invoice`, method: "POST", body: { invoiceId: invoice.id }}).then( res => this.handleErrors(res) );

  fetchInvoiceList = () => this.props.fetch({ url: "/invoice-list", method: "POST", body: { id: this.state.selectedClient.id }}).then(res => this.handleErrors(res))

  fetchClientAddresses = () => this.props.fetch({ url: '/get/client-addresses', method: "POST", body: { id: this.state.selectedClient.id } }).then( res => this.handleErrors(res) );
  
  editInvoice = invoice => this.setState({ invoiceCurrentlyBeingEdited: invoice, displayInvoiceForm: true });

  deleteInvoice = invoice => {
      this.fetchDeleteInvoice(invoice)
      .then( res => {
        this.updateStatusBarMessage(res.message); 
        this.fetchInvoiceList()
        .then(res => this.setState({ invoices: res })).catch(err => console.log("An error occurred during fetch"))
    }).catch(err => this.updateStatusBarMessage("An error occurred. Please try again."));
  }

  getItemFromList = (value, list) => list.find(item => item.id == value);

  onClientDropdownValueSelect = (e, clients) => {
    if (e.target.value) {
      this.setState({ selectedClient: this.getItemFromList(e.target.value, clients), displayInvoiceForm: false, organiseByYear: true, selectedYear: undefined, invoicesPerPage: '', pageOfInvoicesToDisplay: undefined  }, 
      () => {
        this.fetchInvoiceList().then(res => this.setState({ invoices: res, })).catch(err => console.log("An error occurred during fetch"));
        this.fetchClientAddresses(fetch).then(res => this.setState({ clientAddresses: res })).catch(err => console.log("An error occurred during fetch"));
      }) 
    } else {
      this.setState({ selectedClient: undefined, displayInvoiceForm: false, invoiceCurrentlyBeingEdited: false, organiseByYear: true, selectedYear: undefined, invoicesPerPage: '', pageOfInvoicesToDisplay: undefined });
    }
  }

  getHeaderContent = () => {
    const {invoiceCurrentlyBeingEdited, displayInvoiceForm, selectedClient} = this.state;
    let header = undefined
    if (selectedClient && displayInvoiceForm && invoiceCurrentlyBeingEdited) {
      header = <h3>Edit Invoice For {selectedClient.name}</h3>
    } else if (selectedClient, displayInvoiceForm) {
      header = <h3>New Invoice For {selectedClient.name}</h3>
    } else {
      header = <h3>Invoices For {selectedClient.name}</h3>
    }
    return header;
  }

  closeForm = () => this.setState({ displayInvoiceForm: false, invoiceCurrentlyBeingEdited: undefined });

  displayInvoiceListControls = (selectedClient, invoices, displayInvoiceForm) => selectedClient && invoices && !displayInvoiceForm;

  displayInvoiceList = (selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage ) => this.displayInvoiceListControls(selectedClient, invoices, displayInvoiceForm) && (selectedYear || invoicesPerPage);
  
  displayListPaginationLinks = (selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage, organiseByYear) => this.displayInvoiceList(selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage ) && invoicesPerPage && !organiseByYear;
  
  loadInvoiceForm = () => this.setState({ displayInvoiceForm: true });

  displayNewInvoiceButton = (selectedClient, displayInvoiceForm, invoiceCurrentlyBeingEdited) => selectedClient && !displayInvoiceForm && !invoiceCurrentlyBeingEdited;

  handleRadioSelect = e => e.target.value == "true" ? this.setState({ organiseByYear: true, invoicesPerPage: '' }) : this.setState({ organiseByYear: false, selectedYear: undefined });

  displayPageOfInvoices = index => {
    const {invoicesPerPage, invoices} = this.state;
    const sliceStart = index * parseInt(invoicesPerPage);
    this.setState({ pageOfInvoicesToDisplay: invoices.slice(sliceStart, sliceStart + parseInt(invoicesPerPage)) });
  }

  initialiseListControls = () => this.setState({ organiseByYear: true, selectedYear: undefined, invoicesPerPage: '', pageOfInvoicesToDisplay: undefined });

  setInvoicesPerPage = e => e.target.value > 0 ? this.setState({ invoicesPerPage: e.target.value}) : this.setState({ invoicesPerPage: 0, pageOfInvoicesToDisplay: undefined });
  
  onInvoiceListYearSelect = (e) => this.setState({ selectedYear: e.target.value });

  updateStatusBarMessage = message => this.setState({ statusMessage: message });

  triggerStatusBarTransition = statusMessage =>  {
    const transitionDuration = 5000;
    statusBarTransition(statusMessage, transitionDuration);
    // Allow time to fade out before resetting the message
    setTimeout(() => this.updateStatusBarMessage(''), transitionDuration + 1500);
  }

  render() {                                            
    const {clients, myAddresses} = this.props;
    const {selectedClient, displayInvoiceForm, invoices, clientAddresses, invoiceCurrentlyBeingEdited, organiseByYear, invoicesPerPage, selectedYear, pageOfInvoicesToDisplay, statusMessage} = this.state;
    statusMessage ? this.triggerStatusBarTransition(statusMessage) : null;
    return (
        <div>
          <div>
            <div className="panel-title">
              { selectedClient ? this.getHeaderContent() : <h3>Invoices</h3> }
            </div>
            <StatusBar message={statusMessage} />
            <div className="panel-controls">
              <div id="client-select">
                { clients ? <div><label>Client: </label><Dropdown id="client-select" dropdownItems={clients} propToUseAsItemText="name" value={selectedClient ? selectedClient.id : ''} changeHandler={(e) => this.onClientDropdownValueSelect(e, clients)}/></div>: <p className="invoices-feedback">You need to add a client</p> }
              </div>
              { this.displayNewInvoiceButton(selectedClient, displayInvoiceForm, invoiceCurrentlyBeingEdited) ? <button onClick={() => this.loadInvoiceForm() } className="btn btn-primary" >New Invoice</button> : null }
            </div>

            <div>
              { this.displayInvoiceListControls(selectedClient, invoices, displayInvoiceForm) ? 
                <InvoiceListControls
                  organiseByYear={organiseByYear}
                  selectedYear={selectedYear} 
                  invoicesPerPage={invoicesPerPage}
                  invoices={invoices}
                  handleRadioSelect={this.handleRadioSelect}
                  onInvoiceListYearSelect={this.onInvoiceListYearSelect}   
                  setInvoicesPerPage={this.setInvoicesPerPage}     
                /> 
                : null }
            </div>
          
            <div>
              { this.displayInvoiceList(selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage) ? 
                  <InvoiceList
                    selectedClient={selectedClient.id}
                    organiseByYear={organiseByYear}
                    selectedYear={selectedYear}
                    invoices={invoices} 
                    pageOfInvoicesToDisplay={pageOfInvoicesToDisplay}
                    editInvoice={this.editInvoice} 
                    viewInvoice={this.viewInvoice}
                    deleteInvoice={this.deleteInvoice}
                  /> 
                  : null }
            </div>

            <div>
              { this.displayListPaginationLinks(selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage, organiseByYear) ? 
                <PaginationLinks 
                  totalInvoices={invoices.length} 
                  invoicesPerPage={invoicesPerPage} 
                  displayPageOfInvoices={this.displayPageOfInvoices}
                /> 
                : null }
            </div>
            
            { displayInvoiceForm ? 
                <InvoiceForm 
                  clientAddresses={clientAddresses.filter(address => address.clientId === selectedClient.id)}
                  myAddresses={myAddresses}
                  updateStatusBarMessage={this.updateStatusBarMessage}
                  handleErrors={this.handleErrors}
                  closeForm={this.closeForm}
                  changeHandler={(e) => this.onDropdownValueSelect(e, clients)}
                  invoice={this.state.invoiceCurrentlyBeingEdited ? this.state.invoiceCurrentlyBeingEdited : undefined }
                  invoiceBeingEdited={invoiceCurrentlyBeingEdited}
                  refreshInvoiceList={() => this.fetchInvoiceList().then(res => this.setState({ invoices: res }))}
                />
              : null 
            }
          </div>
        </div>
    )
  }
}

export default withRouter(Invoices);