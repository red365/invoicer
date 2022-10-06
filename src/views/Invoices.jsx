import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import Dropdown from '../components/Dropdown';
import InvoiceList from '../components/InvoiceList';
import PaginationLinks from '../components/PaginationLinks';
import InvoiceListControls from '../components/InvoiceListControls';
import StatusBar from '../components/StatusBar';
import statusBarTransition from '../utils/statusBarTransition';
import useAPI from '../hooks/useAPI';

function Invoices(props) {
  function initaliseInvoiceViewParams() {
    return {
      invoiceCurrentlyBeingEdited: undefined,
      selectedClient: { id: undefined, name: undefined },
      displayInvoiceForm: false,
      organiseByYear: true,
      selectedYear: undefined,
      invoicesPerPage: '',
      pageOfInvoicesToDisplay: undefined,
      statusMessage: ''
    };
  }

  const [invoiceViewParams, setInvoiceViewParams] = useState(initaliseInvoiceViewParams());
  const { selectedClient, displayInvoiceForm, invoices, clientAddresses, invoiceCurrentlyBeingEdited, organiseByYear, invoicesPerPage, selectedYear, pageOfInvoicesToDisplay, statusMessage } = invoiceViewParams;
  const { myAddresses, contactDetails, clients } = useAPI().data;

  useEffect(() => {
    console.log("selectedClient", selectedClient)
    if (selectedClient.id) {
      fetchInvoiceList().then(res => updateViewParams({ invoices: res }).catch(err => console.log("An error occurred during fetch")));
      fetchClientAddresses().then(res => updateViewParams({ clientAddresses: res }).catch(err => console.log("An error occurred during fetch")));
    }
  }, [selectedClient.id]);

  function viewInvoice(invoice) {
    props.history.push(
      {
        pathname: '/view-invoice',
        state: {
          invoice: invoice,
          clientAddress: getItemFromList(invoice.clientRef, clientAddresses),
          businessAddress: getItemFromList(invoice.myAddressRef, myAddresses),
          contactDetails: contactDetails,
          client: selectedClient
        }
      });
  }

  function handleAnyErrors(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  }

  function fetchWrapper(opts) {
    const fetchOpts = { method: opts.method };
    if (fetchOpts.method == "POST") {
      fetchOpts.headers = { "Content-Type": "application/json; charset=utf-8" };
      fetchOpts.body = JSON.stringify(opts.body);
    }
    return fetch(opts.url, fetchOpts);
  }

  function fetchDeleteInvoice(invoice) {
    return fetchWrapper({ url: `/delete/invoice`, method: "POST", body: { invoiceId: invoice.id } }).then(res => handleAnyErrors(res));
  }

  function fetchInvoiceList() {
    console.log("selectedClient: ", selectedClient)
    return fetchWrapper({ url: "/invoice-list", method: "POST", body: { id: selectedClient.id } }).then(res => handleAnyErrors(res));
  }

  function fetchClientAddresses() {
    return fetchWrapper({ url: '/get/client-addresses', method: "POST", body: { id: selectedClient.id } }).then(res => handleAnyErrors(res));
  }

  function editInvoice(invoice) {
    updateViewParams({ invoiceCurrentlyBeingEdited: invoice, displayInvoiceForm: true });
  }

  function updateViewParams(newViewParams) {
    console.log(newViewParams);
    setInvoiceViewParams((prev) => {
      return { ...prev, ...newViewParams };
    })
  }

  function deleteInvoice(invoice) {
    fetchDeleteInvoice(invoice)
      .then(res => {
        updateStatusBarMessage(res.message);
        fetchInvoiceList()
          .then(res => updateViewParams({ invoices: res }).catch(err => console.log("An error occurred during fetch")));
      }).catch(err => updateStatusBarMessage("An error occurred. Please try again."));
  }

  function getItemFromList(value, list) {
    return list.find(item => item.id == value);
  }

  function onClientDropdownValueSelect(e, clients) {
    if (e.target.value) {
      updateViewParams(
        {
          selectedClient: getItemFromList(e.target.value, clients),
          displayInvoiceForm: false,
          organiseByYear: true,
          selectedYear: undefined,
          invoicesPerPage: '',
          pageOfInvoicesToDisplay: undefined
        }
      );
      // this.setState({ selectedClient: getItemFromList(e.target.value, clients), displayInvoiceForm: false, organiseByYear: true, selectedYear: undefined, invoicesPerPage: '', pageOfInvoicesToDisplay: undefined },
      //   () => {
      //     this.fetchInvoiceList().then(res => this.setState({ invoices: res, })).catch(err => console.log("An error occurred during fetch"));
      //     this.fetchClientAddresses(fetch).then(res => this.setState({ clientAddresses: res })).catch(err => console.log("An error occurred during fetch"));
      //   })
    } else {
      updateViewParams(
        {
          selectedClient: undefined,
          displayInvoiceForm: false,
          invoiceCurrentlyBeingEdited: false,
          organiseByYear: true,
          selectedYear: undefined,
          invoicesPerPage: '',
          pageOfInvoicesToDisplay: undefined
        }
      );
    }
  }

  function getHeaderContent() {
    const { invoiceCurrentlyBeingEdited, displayInvoiceForm, selectedClient } = invoiceViewParams;
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

  function closeForm() {
    updateViewParams({ displayInvoiceForm: false, invoiceCurrentlyBeingEdited: undefined });
  }

  function displayInvoiceListControls(selectedClient, invoices, displayInvoiceForm) {
    console.log(selectedClient, invoices, !displayInvoiceForm)
    return selectedClient && invoices && !displayInvoiceForm;
  }

  function displayInvoiceList(selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage) {
    //console.log("Params: ", selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage)
    //console.log("displayInvoiceList:", selectedClient && invoices && !displayInvoiceForm, (selectedYear || invoicesPerPage))
    return displayInvoiceListControls(selectedClient, invoices, displayInvoiceForm) && (selectedYear || invoicesPerPage);
  }

  function displayListPaginationLinks(selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage, organiseByYear) {
    return displayInvoiceList(selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage) && invoicesPerPage && !organiseByYear;
  }

  function loadInvoiceForm() {
    updateViewParams({ displayInvoiceForm: true });
  }

  function displayNewInvoiceButton(selectedClient, displayInvoiceForm, invoiceCurrentlyBeingEdited) {
    return selectedClient && !displayInvoiceForm && !invoiceCurrentlyBeingEdited;
  }

  function handleRadioSelect(e) {
    e.target.value == "true" ? updateViewParams({ organiseByYear: true, invoicesPerPage: '' }) : updateViewParams({ organiseByYear: false, selectedYear: undefined });
  }

  function displayPageOfInvoices(index) {
    const { invoicesPerPage, invoices } = invoiceViewParams;
    const sliceStart = index * parseInt(invoicesPerPage);
    updateViewParams({ pageOfInvoicesToDisplay: invoices.slice(sliceStart, sliceStart + parseInt(invoicesPerPage)) });
  }

  function initialiseListControls() {
    updateViewParams({ organiseByYear: true, selectedYear: undefined, invoicesPerPage: '', pageOfInvoicesToDisplay: undefined })
  }

  function setInvoicesPerPage(e) {
    if (e.target.value >= 0) {
      updateViewParams({ invoicesPerPage: e.target.value });
    } else {
      updateViewParams({ invoicesPerPage: '' });
      updateViewParams({ pageOfInvoicesToDisplay: undefined });
    }
  }

  function onInvoiceListYearSelect(e) {
    updateViewParams({ selectedYear: e.target.value });
  }

  function updateStatusBarMessage(message) {
    updateViewParams({ statusMessage: message });
  }

  function triggerStatusBarTransition(statusMessage) {
    const transitionDuration = 5000;
    statusBarTransition(statusMessage, transitionDuration);
    // Allow time to fade out before resetting the message
    setTimeout(() => updateStatusBarMessage(''), transitionDuration + 1500);
  }

  statusMessage ? triggerStatusBarTransition(statusMessage) : null;
  console.log("display invoice list controls: ", displayInvoiceListControls(selectedClient, invoices, displayInvoiceForm))
  console.log("ipp", invoicesPerPage);

  return (
    <div>
      <div>
        <div className="panel-title">
          {selectedClient ? getHeaderContent() : <h3>Invoices</h3>}
        </div>
        <StatusBar message={statusMessage} />
        <div className="panel-controls">
          <div id="client-select">
            {clients ? <div><label>Client: </label><Dropdown id="client-select" dropdownItems={clients} propToUseAsItemText="name" value={selectedClient ? selectedClient.id : ''} changeHandler={(e) => onClientDropdownValueSelect(e, clients)} /></div> : <p className="invoices-feedback">You need to add a client</p>}
          </div>
          {displayNewInvoiceButton(selectedClient, displayInvoiceForm, invoiceCurrentlyBeingEdited) ? <button onClick={() => loadInvoiceForm()} className="btn btn-primary" >New Invoice</button> : null}
        </div>

        <div>
          {displayInvoiceListControls(selectedClient, invoices, displayInvoiceForm) ?
            <InvoiceListControls
              organiseByYear={organiseByYear}
              selectedYear={selectedYear}
              invoicesPerPage={invoicesPerPage}
              invoices={invoices}
              handleRadioSelect={handleRadioSelect}
              onInvoiceListYearSelect={onInvoiceListYearSelect}
              setInvoicesPerPage={setInvoicesPerPage}
            />
            : null}
        </div>

        <div>
          {displayInvoiceList(selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage) ?
            <InvoiceList
              selectedClient={selectedClient.id}
              organiseByYear={organiseByYear}
              selectedYear={selectedYear}
              invoices={invoices}
              pageOfInvoicesToDisplay={pageOfInvoicesToDisplay}
              editInvoice={editInvoice}
              viewInvoice={viewInvoice}
              deleteInvoice={deleteInvoice}
            />
            : null}
        </div>

        <div>
          {displayListPaginationLinks(selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage, organiseByYear) ?
            <PaginationLinks
              totalInvoices={invoices.length}
              invoicesPerPage={invoicesPerPage}
              displayPageOfInvoices={displayPageOfInvoices}
            />
            : null}
        </div>

        {displayInvoiceForm ?
          <InvoiceForm
            clientAddresses={clientAddresses.filter(address => address.clientId === selectedClient.id)}
            myAddresses={myAddresses}
            updateStatusBarMessage={updateStatusBarMessage}
            handleErrors={handleAnyErrors}
            closeForm={closeForm}
            // changeHandler={(e) => onDropdownValueSelect(e, clients)}
            invoice={invoiceCurrentlyBeingEdited ? invoiceCurrentlyBeingEdited : undefined}
            invoiceBeingEdited={invoiceCurrentlyBeingEdited}
            refreshInvoiceList={() => fetchInvoiceList().then(res => updateViewParams("invoices", res)).catch(err => console.log("An error occurred during fetch"))}
          />
          : null
        }
      </div>
    </div>
  )
}

export default withRouter(Invoices);