import React, { FC, useState, useEffect, ChangeEvent } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  FetchWrapperOpts,
  InvoiceViewParams,
  NewViewParams,
  Invoice,
  MyAddress,
  ClientAddress,
  ContactDetails,
  Client,
  ObjectWithId
} from '../types';
import InvoiceForm from '../components/InvoiceForm';
import Dropdown from '../components/Dropdown';
import InvoiceList from '../components/InvoiceList';
import PaginationLinks from '../components/PaginationLinks';
import InvoiceListControls from '../components/InvoiceListControls';
import StatusBar from '../components/StatusBar';
import useStatusBar from '../hooks/useStatusBar';
import useAPI from '../hooks/useAPI';
import _ from 'lodash';


const Invoices: FC<RouteComponentProps> = (props) => {
  const initaliseInvoiceViewParams = (): InvoiceViewParams => {
    return {
      invoiceCurrentlyBeingEdited: undefined,
      selectedClient: { id: undefined, name: undefined },
      displayInvoiceForm: false,
      organiseByYear: true,
      selectedYear: undefined,
      invoicesPerPage: undefined,
      pageOfInvoicesToDisplay: undefined,
      statusMessage: '',
      invoices: [],
      clientAddresses: []
    };
  }

  const [invoiceViewParams, setInvoiceViewParams] = useState<InvoiceViewParams>(initaliseInvoiceViewParams());

  const { selectedClient, displayInvoiceForm, invoices, clientAddresses, invoiceCurrentlyBeingEdited, organiseByYear, invoicesPerPage, selectedYear, pageOfInvoicesToDisplay } = invoiceViewParams;
  const { myAddresses, contactDetails, clients }: { myAddresses?: MyAddress[]; contactDetails?: ContactDetails; clients?: Client[] } = useAPI().data;

  const [notificationConfig, setNotificationConfig] = useStatusBar();

  useEffect(() => {
    if (selectedClient.id) {
      fetchInvoiceList().then((res) => updateViewParams({ invoices: sortInvoices(res) })).catch(err => setNotificationConfig({ message: "An error occurred during fetch", style: "error" }));
      fetchClientAddresses().then(res => updateViewParams({ clientAddresses: res })).catch(err => setNotificationConfig({ message: "An error occurred during fetch", style: "error" }));
    }
  }, [selectedClient.id]);

  const viewInvoice = (invoice: Invoice): void => {
    props.history.push(
      {
        pathname: '/view-invoice',
        state: {
          invoice: invoice,
          clientAddress: getItemFromList(invoice.clientRef, clientAddresses),
          businessAddress: getItemFromList(invoice.myAddressRef, myAddresses as MyAddress[]),
          contactDetails: contactDetails,
          client: selectedClient
        }
      });
  }

  function handleAnyErrors<T>(response: Response): Promise<T> {
    if (response.ok) {
      const res: Promise<T> = response.json();
      return res;
    } else {
      throw Error(response.statusText);
    }
  }

  const fetchWrapper = (opts: FetchWrapperOpts): Promise<Response> => {
    const fetchOpts: RequestInit = { method: opts.method };
    if (fetchOpts.method == "POST") {
      fetchOpts.headers = { "Content-Type": "application/json; charset=utf-8" };
      fetchOpts.body = JSON.stringify(opts.body);
    }
    return fetch(opts.url, fetchOpts);
  }

  const fetchDeleteInvoice = (invoice: Invoice): Promise<any> => {
    return fetchWrapper({ url: `/delete/invoice`, method: "POST", body: { invoiceId: invoice.id } }).then(res => handleAnyErrors(res));
  }

  const fetchInvoiceList = (): Promise<Invoice[]> => {
    return fetchWrapper({ url: "/invoice-list", method: "POST", body: { id: selectedClient.id } }).then(res => handleAnyErrors(res));
  }

  const fetchClientAddresses = (): Promise<ClientAddress[]> => {
    return fetchWrapper({ url: '/get/client-addresses', method: "POST", body: { id: selectedClient.id } }).then(res => handleAnyErrors(res));
  }

  const editInvoice = (invoice: Invoice): void => {
    updateViewParams({ invoiceCurrentlyBeingEdited: invoice, displayInvoiceForm: true });
  }

  const updateViewParams = (newViewParams: NewViewParams): void => {
    setInvoiceViewParams((prev: InvoiceViewParams): InvoiceViewParams => {
      return { ...prev, ...newViewParams };
    })
  }

  const deleteInvoice = (invoice: Invoice): void => {
    fetchDeleteInvoice(invoice)
      .then((res: any) => {
        setNotificationConfig({ message: res.message, style: "success" });
        fetchInvoiceList()
          .then((res: any) => updateViewParams({ invoices: res })).catch(err => setNotificationConfig({ message: "An error occurred. Please try again.", style: "error" }));
      }).catch((err: any) => setNotificationConfig({ message: "An error occurred. Please try again.", style: "error" }));
  }

  function getItemFromList<T extends ObjectWithId>(value: number, list: T[]): T | undefined {
    return _.find(list, (item) => item.id == value)
  }

  const onClientDropdownValueSelect = (e: ChangeEvent<HTMLSelectElement>, clients: Client[]): void => {
    if (e.target.value) {
      updateViewParams(
        {
          selectedClient: getItemFromList(parseInt(e.target.value), clients),
          displayInvoiceForm: false,
          organiseByYear: true,
          selectedYear: undefined,
          invoicesPerPage: undefined,
          pageOfInvoicesToDisplay: undefined
        }
      );
    } else {
      updateViewParams(
        {
          selectedClient: undefined,
          displayInvoiceForm: false,
          invoiceCurrentlyBeingEdited: undefined,
          organiseByYear: true,
          selectedYear: undefined,
          invoicesPerPage: undefined,
          pageOfInvoicesToDisplay: undefined
        }
      );
    }
  }

  const getHeaderContent = (): JSX.Element => {
    const { invoiceCurrentlyBeingEdited, displayInvoiceForm, selectedClient } = invoiceViewParams;
    let header: JSX.Element;
    if (selectedClient && displayInvoiceForm && invoiceCurrentlyBeingEdited) {
      header = <h3>Edit Invoice For {selectedClient.name}</h3>
    } else if (selectedClient && displayInvoiceForm) {
      header = <h3>New Invoice For {selectedClient.name}</h3>
    } else {
      header = <h3>Invoices For {selectedClient.name}</h3>
    }
    return header;
  }

  const closeForm = (): void => {
    updateViewParams({ displayInvoiceForm: false, invoiceCurrentlyBeingEdited: undefined });
  }

  const displayInvoiceListControls = (selectedClient: Client, invoices: Invoice[], displayInvoiceForm: boolean): boolean => {
    return Boolean(selectedClient.id && invoices.length > 0 && !displayInvoiceForm);
  }

  const displayInvoiceList = (selectedClient: Client, invoices: Invoice[], displayInvoiceForm: boolean, selectedYear: number, invoicesPerPage: number): boolean => {
    return Boolean(displayInvoiceListControls(selectedClient, invoices, displayInvoiceForm) && (selectedYear || invoicesPerPage));
  }

  const displayListPaginationLinks = (selectedClient: Client, invoices: Invoice[], displayInvoiceForm: boolean, selectedYear: number, invoicesPerPage: number, organiseByYear: boolean): boolean => {
    return Boolean(displayInvoiceList(selectedClient, invoices, displayInvoiceForm, selectedYear, invoicesPerPage) && invoicesPerPage && !organiseByYear);
  }

  const loadInvoiceForm = (): void => {
    updateViewParams({ displayInvoiceForm: true });
  }

  const displayNewInvoiceButton = (selectedClient: Client, displayInvoiceForm: boolean, invoiceCurrentlyBeingEdited: Invoice | undefined): boolean => {
    return Boolean(selectedClient.id && !displayInvoiceForm && !invoiceCurrentlyBeingEdited);
  }

  const handleRadioSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    e.target.value == "true" ? updateViewParams({ organiseByYear: true, invoicesPerPage: undefined }) : updateViewParams({ organiseByYear: false, selectedYear: undefined });
  }

  const displayPageOfInvoices = (index: number): void => {
    const { invoicesPerPage, invoices } = invoiceViewParams;
    const sliceStart = index * invoicesPerPage!;
    updateViewParams({ pageOfInvoicesToDisplay: invoices.slice(sliceStart, sliceStart + invoicesPerPage!) });
  }

  const setInvoicesPerPage = (e: ChangeEvent<HTMLInputElement>): void => {
    if (parseInt(e.target.value) >= 0) {
      updateViewParams({ invoicesPerPage: parseInt(e.target.value) });
    } else {
      updateViewParams({ invoicesPerPage: undefined });
      updateViewParams({ pageOfInvoicesToDisplay: undefined });
    }
  }

  const onInvoiceListYearSelect = (e: ChangeEvent<HTMLSelectElement>): void => {
    updateViewParams({ selectedYear: parseInt(e.target.value) });
  }

  const refreshInvoiceList = (): Promise<void> => {
    return fetchInvoiceList().then(res => updateViewParams({ invoices: res }));
  }

  const sortInvoices = (invoices: Invoice[]): Invoice[] => {
    const sortedInvoices: Invoice[] = _.sortBy(invoices, ["year", "month"]);
    return sortedInvoices;
  }

  return (
    <div>
      <div>
        <div className="panel-title">
          {selectedClient ? getHeaderContent() : <h3>Invoices</h3>}
        </div>
        <StatusBar notificationConfig={notificationConfig} />
        <div className="panel-controls">
          <div id="client-select">
            {clients ? <div><label>Client: </label><Dropdown id="client-select" dropdownItems={clients} propToUseAsItemText="name" value={selectedClient ? selectedClient.id! : ''} changeHandler={(e: ChangeEvent<HTMLSelectElement>) => onClientDropdownValueSelect(e, clients)} /></div> : <p className="invoices-feedback">You need to add a client</p>}
          </div>
          {displayNewInvoiceButton(selectedClient, displayInvoiceForm, invoiceCurrentlyBeingEdited) ? <button onClick={() => loadInvoiceForm()} className="btn btn-primary" >New Invoice</button> : null}
        </div>

        <div>
          {displayInvoiceListControls(selectedClient, invoices, displayInvoiceForm) ?
            <InvoiceListControls
              organiseByYear={organiseByYear}
              selectedYear={selectedYear!}
              invoicesPerPage={invoicesPerPage!}
              invoices={invoices}
              handleRadioSelect={handleRadioSelect}
              onInvoiceListYearSelect={onInvoiceListYearSelect}
              setInvoicesPerPage={setInvoicesPerPage}
            />
            : null}
        </div>

        <div>
          {displayInvoiceList(selectedClient, invoices, displayInvoiceForm, selectedYear!, invoicesPerPage!) ?
            <InvoiceList
              selectedClient={selectedClient}
              organiseByYear={organiseByYear}
              selectedYear={selectedYear!}
              invoices={sortInvoices(invoices)}
              pageOfInvoicesToDisplay={_.sortBy(pageOfInvoicesToDisplay!, ["year", "month"])}
              editInvoice={editInvoice}
              viewInvoice={viewInvoice}
              deleteInvoice={deleteInvoice}
            />
            : null}
        </div>

        <div>
          {displayListPaginationLinks(selectedClient, invoices, displayInvoiceForm, selectedYear!, invoicesPerPage!, organiseByYear) ?
            <PaginationLinks
              totalInvoices={invoices.length}
              invoicesPerPage={invoicesPerPage!}
              displayPageOfInvoices={displayPageOfInvoices}
            />
            : null}
        </div>

        {displayInvoiceForm ?
          <InvoiceForm
            clientAddresses={clientAddresses.filter(address => address.clientId === selectedClient.id)}
            myAddresses={myAddresses!}
            notificationConfig={notificationConfig}
            setNotificationConfig={setNotificationConfig}
            handleErrors={handleAnyErrors}
            closeForm={closeForm}
            invoice={invoiceCurrentlyBeingEdited ? invoiceCurrentlyBeingEdited : undefined}
            invoiceBeingEdited={invoiceCurrentlyBeingEdited}
            refreshInvoiceList={refreshInvoiceList}
          />
          : null
        }
      </div>
    </div>
  )
}

export default withRouter(Invoices);