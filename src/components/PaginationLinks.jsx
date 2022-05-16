import React, { Component } from 'react';

class PaginationLinks extends Component {
  state = { activePageIndex: 0 };

  componentDidMount = () => this.props.displayPageOfInvoices(this.state.activePageIndex);

  getNumberOfPages = (invoicesPerPage, totalInvoices) => Math.ceil(totalInvoices / invoicesPerPage);

  setActivePage = index => {
    this.setState({ activePageIndex: index });
    this.props.displayPageOfInvoices(index);
  }

  componentWillUpdate = (nextProps, nextState) => this.props.invoicesPerPage != nextProps.invoicesPerPage ? this.setActivePage(0) : null;
  
  generatePaginationButtons = (invoicesPerPage, totalInvoices, activePageIndex) => invoicesPerPage > 0 ? [...Array(this.getNumberOfPages(invoicesPerPage, totalInvoices))].map(( el, i ) => <button key={i} type="button" className={`${activePageIndex == i ? "active-page" : "" } pagination-button invoice-list-button btn`} value={i} onClick={(e) => this.setActivePage(e.target.value)} >{i + 1}</button>) : null;

  render() {
    const {invoicesPerPage, totalInvoices} = this.props;
    const {activePageIndex} = this.state;
    return (
      <div id="pagination-links">
        { this.generatePaginationButtons(invoicesPerPage, totalInvoices, activePageIndex) }
      </div>
    )
  }
}

export default PaginationLinks;