import { ChangeEvent, Dispatch, SetStateAction } from 'react';

export interface InvoiceViewParams {
    invoiceCurrentlyBeingEdited: Invoice | undefined;
    selectedClient: Client;
    displayInvoiceForm: boolean;
    organiseByYear: boolean;
    selectedYear: undefined | number;
    invoicesPerPage: number | undefined;
    pageOfInvoicesToDisplay: undefined | Invoice[];
    statusMessage: string;
    invoices: Invoice[];
    clientAddresses: ClientAddress[];
}

export interface TimesheetRow {
    day: string;
    date: string;
    project: string;
    task: string;
    time: number;
}

export interface NotificationParams {
    message: string;
    style: string;
}

export interface InvoiceState {
    invoice: Invoice;
    client: Client;
    clientAddress: ClientAddress;
    businessAddress: MyAddress;
    contactDetails: ContactDetails;
}

export interface NewViewParams {
    invoiceCurrentlyBeingEdited?: Invoice | undefined;
    displayInvoiceForm?: boolean;
    organiseByYear?: boolean;
    invoices?: Invoice[];
    clientAddresses?: ClientAddress[];
    selectedClient?: Client;
    selectedYear?: undefined | number;
    invoicesPerPage?: number;
    pageOfInvoicesToDisplay?: undefined | Invoice[];
}

export interface Invoice {
    id: number;
    month: number;
    year: number;
    rate: number;
    date: string;
    daysOff: number;
    hours: number;
    description: string;
    csvFilename: string;
    clientRef: number;
    myAddressRef: number;
}

export interface UnsavedInvoice {
    monthWorked: number | undefined;
    year: number | undefined;
    hourlyRate: number | undefined;
    invoiceDate: string;
    daysOff: number | undefined;
    description: string;
    csvFilename: string;
    mySelectedAddress: MyAddress | undefined;
    selectedClientAddress: ClientAddress | undefined;
}

export interface InvoiceFormParams {
    monthWorked: number | undefined;
    year: number | undefined;
    hourlyRate: number | undefined;
    invoiceDate: string;
    daysOff: number | undefined;
    description: string;
    csvFilename: string;
    mySelectedAddress: MyAddress | undefined;
    selectedClientAddress: ClientAddress | undefined;
}

export interface Address {
    addressLineOne: string;
    addressLineTwo: string;
    addressLineThree: string;
    addressLineFour: string;
    city: string;
    countyOrState: string;
    postOrZipCode: string;
}

export interface MyAddress extends Address {
    id: number;
    isClientAddress: boolean;
}

export interface ClientAddress extends Address {
    name: string;
    id: number;
    clientId: number;
}

export interface FetchOpts {
    url: string;
}

export interface CreateAddressFetchOpts extends FetchOpts {
    body: CreateAddressFetchOptsBody;
}

export interface CreateClientFetchOpts extends FetchOpts {
    body: CreateClientFetchOptsBody;
}

export interface CreateClientFetchOptsBody {
    address?: Address;
    clientName: String;
    addAddress: Boolean;
}

export interface CreateAddressFetchOptsBody {
    address: Address;
    isClientAddress: Boolean;
    selectedClient?: Client;
}

export interface FetchWrapperOpts extends FetchOpts {
    method: string;
    body: FetchWrapperOptsBody;
}

interface FetchWrapperOptsBody {
    invoiceId?: number;
    id?: number;
}

export interface Client {
    id: undefined | number;
    name: undefined | string;
}

export interface ContactDetails {
    businessName: string;
    phone: number;
    email: string;
}

type APIDataType = "clients" | "myAddresses" | "contactDetails";

// type APIData = Record<APIDataType, Client[] | MyAddress[] | ContactDetails>;

export interface APIData {
    clients?: Client[];
    myAddresses?: MyAddress[];
    contactDetails?: ContactDetails;
}

export interface InvoiceSummaryComponentProps {
    timesheetEntries: TimesheetEntries;
    invoice: Invoice;
    getInvoiceAmount: (rate: number, hours: number) => string;
}

export interface SummaryTableComponentProps {
    description: Invoice["description"];
    hours: Invoice["hours"];
    price: Invoice["rate"];
    amount: string;
}

export interface ClientAddressComponentProps {
    address: ClientAddress;
    client: Client;
    className: string;
}

export interface BusinessAddressComponentProps {
    address: MyAddress;
    contactDetails: ContactDetails;
}

export interface TotalTableComponentProps {
    amount: string;
}

export interface ItemisedTableComponentProps {
    timesheetEntries: TimesheetEntries;
}

export interface DropdownComponentProps {
    id: string;
    name?: string;
    classes?: string;
    value: string | number;
    propToUseAsItemText: string;
    dropdownItems: any[];
    changeHandler: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export interface AddressFieldsComponentProps extends Address {
    changeHandler: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface InvoiceFormComponentProps {
    clientAddresses: ClientAddress[];
    myAddresses: MyAddress[];
    invoiceBeingEdited: Invoice | undefined;
    notificationConfig: NotificationParams;
    refreshInvoiceList: () => Promise<void>;
    closeForm: () => void;
    invoice: Invoice | undefined;
    setNotificationConfig: Dispatch<React.SetStateAction<NotificationParams>>;
    handleErrors: (res: any) => any | undefined;
}

export interface InvoiceToBeSaved extends Omit<Invoice, "id"> {
    id?: number;
}

export interface InvoiceListComponentProps {
    selectedClient: Client;
    organiseByYear: boolean;
    selectedYear: number;
    invoices: Invoice[];
    pageOfInvoicesToDisplay: Invoice[];
    editInvoice: (invoice: Invoice) => void;
    viewInvoice: (invoice: Invoice) => void;
    deleteInvoice: (invoice: Invoice) => void;
}

export interface ObjectWithId {
    id: number | undefined;
}

export interface InvoiceListControlsComponentProps {
    organiseByYear: boolean;
    selectedYear: number;
    invoicesPerPage: number;
    invoices: Invoice[];
    handleRadioSelect: (e: ChangeEvent<HTMLInputElement>) => void;
    onInvoiceListYearSelect: (e: ChangeEvent<HTMLSelectElement>) => void;
    setInvoicesPerPage: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface PaginationLinksComponentProps {
    totalInvoices: number;
    invoicesPerPage: number;
    displayPageOfInvoices: (index: number) => void;
}

export interface StatusBarComponentProps {
    notificationConfig: NotificationParams;
}

export type UpdatedInVoiceFormParms = Partial<InvoiceFormParams>
export type TimesheetEntries = TimesheetRow[];

// SQL query types

export type SaveInvoiceQueryParams = Invoice;
export interface UpdateInvoiceQueryParams extends Omit<Invoice, "id"> {
    id: number;
}

export interface DeleteInvoiceQueryParams {
    invoiceId: number;
}

export type InvoiceQueryParams = DeleteInvoiceQueryParams;
export interface InvoiceListQueryParams {
    id: number;
}
export type ClientAddressesQueryParams = InvoiceListQueryParams;
export interface CreateClientQueryParams {
    [clientName: string]: string | string[];
}
export interface AddressQueryParams extends Address {
    isClientAddress: boolean;
}
export interface CreateClientAddressQueryParams {
    clientId: number;
    addressId: number;
}