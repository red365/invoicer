import React, { useState, useEffect, useRef } from 'react';

function PaginationLinks(props) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const { displayPageOfInvoices, invoicesPerPage, totalInvoices } = props;
  const invoicesPerPageRef = useRef(invoicesPerPage);

  console

  useEffect(() => displayPageOfInvoices(activePageIndex), []);
  useEffect(() => {
    if (invoicesPerPageRef.current != invoicesPerPage) {
      setActivePage(0)
      invoicesPerPageRef.current = invoicesPerPage;
    }
  }, [...props])

  function getNumberOfPages(invoicesPerPage, totalInvoices) {
    return Math.ceil(totalInvoices / invoicesPerPage);
  }

  function setActivePage(index) {
    setActivePageIndex(index);
    displayPageOfInvoices(index);
  }

  // function componentWillUpdate(nextProps, nextState) => this.props.invoicesPerPage != nextProps.invoicesPerPage ? this.setActivePage(0) : null;

  function generatePaginationButtons(invoicesPerPage, totalInvoices, activePageIndex) {
    console.log("Inv per page: ", invoicesPerPage);
    return invoicesPerPage > 0 ? [...Array(getNumberOfPages(invoicesPerPage, totalInvoices))].map((el, i) => {
      console.log(<button key={i} type="button" className={`${activePageIndex == i ? "active-page" : ""} pagination-button invoice-list-button btn`} value={i} onClick={(e) => setActivePage(e.target.value)} >{i + 1}</button>)
      return <button key={i} type="button" className={`${activePageIndex == i ? "active-page" : ""} pagination-button invoice-list-button btn`} value={i} onClick={(e) => setActivePage(e.target.value)} >{i + 1}</button>
    }) : null;
  }

  return (
    <div id="pagination-links">
      {generatePaginationButtons(invoicesPerPage, totalInvoices, activePageIndex)}
    </div>
  )
}

export default PaginationLinks;