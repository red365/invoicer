import React, { FC } from 'react';
import Dropdown from './Dropdown';
import { InvoiceListControlsComponentProps, Invoice } from '../types.js';

const InvoiceListControls: FC<InvoiceListControlsComponentProps> = (props) => {
  const getSetOfYears = (invoices: Invoice[]): number[] => {
    if (invoices) {
      const years: number[] = [];
      invoices.forEach(invoice => {
        if (!years.includes(invoice.year)) {
          years.push(invoice.year);
        }
      });
      return years.sort();
    } else {
      return [];
    }
  }

  const { organiseByYear, handleRadioSelect, invoices, selectedYear, onInvoiceListYearSelect, invoicesPerPage, setInvoicesPerPage } = props;
  return (
    <div className="invoice-list-controls panel-controls" >
      <div className="radio-row">
        <label>Organise invoices by:</label>
        <label htmlFor="organise-year" ><input type="radio" checked={organiseByYear == true} id="organise-year" name="year" value={"true"} onChange={(e) => handleRadioSelect(e)} />Year</label>
        <label htmlFor="organise-pages"><input type="radio" id="organise-pages" checked={organiseByYear == false} name="page" value={"false"} onChange={(e) => handleRadioSelect(e)} />Pages</label>
      </div>

      {organiseByYear ?
        <div>
          <label htmlFor="select-year">Select a year:</label>
          <Dropdown
            id="select-year"
            name="selectYear"
            dropdownItems={getSetOfYears(invoices).map(year => ({ id: year })).sort()}
            changeHandler={onInvoiceListYearSelect}
            propToUseAsItemText="id"
            value={selectedYear ? selectedYear : ''}
          />
        </div>
        : <div>
          <label htmlFor="page-invoice-count">Invoices to a page:</label>
          <input id="page-invoice-count" type="number" className="short-input" value={invoicesPerPage} onChange={(e) => setInvoicesPerPage(e)} />
        </div>
      }
    </div>
  )
}

export default InvoiceListControls;