import React, { useState, useEffect, useRef, FC, ChangeEvent } from 'react';
import { PaginationLinksComponentProps } from '../types.js';

const PaginationLinks: FC<PaginationLinksComponentProps> = (props) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const { displayPageOfInvoices, invoicesPerPage, totalInvoices } = props;
  const invoicesPerPageRef = useRef(invoicesPerPage);

  useEffect(() => displayPageOfInvoices(activePageIndex), []);
  useEffect(() => {
    if (invoicesPerPageRef.current != invoicesPerPage) {
      setActivePage(0)
      invoicesPerPageRef.current = invoicesPerPage;
    }
  }, [invoicesPerPage, totalInvoices])

  const getNumberOfPages = (invoicesPerPage: number, totalInvoices: number) => {
    return Math.ceil(totalInvoices / invoicesPerPage);
  }

  const setActivePage = (index: number): void => {
    setActivePageIndex(index);
    displayPageOfInvoices(index);
  }

  const generatePaginationButtons = (invoicesPerPage: number, totalInvoices: number, activePageIndex: number): JSX.Element[] | null => {
    return invoicesPerPage > 0 ? [...Array(getNumberOfPages(invoicesPerPage, totalInvoices))].map((el, i) => {
      return <button key={i} type="button" className={`${activePageIndex == i ? "active-page" : ""} pagination-button invoice-list-button btn`} value={i} onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => setActivePage(parseInt(e.currentTarget.value))} >{i + 1}</button>
    }) : null;
  }

  return (
    <div id="pagination-links">
      {generatePaginationButtons(invoicesPerPage, totalInvoices, activePageIndex)}
    </div>
  )
}

export default PaginationLinks;