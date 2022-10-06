import React, { useState, useEffect, createContext } from 'react';
import { withRouter, BrowserRouter, Route, Switch } from 'react-router-dom';
import useAPI from '../hooks/useAPI';
// import Clients from './Clients';
import Invoices from './Invoices';
import Invoice from './Invoice';
// import Addresses from './Addresses';
import Header from '../components/Header';

function ViewContainer(props) {
  // state = {
  //   invoices: undefined,
  //   clients: undefined
  // }

  // const {clients, }

  // fetchClients = () => this.fetch({ url: `/get/clients`, method: "GET" }).then(res => res.json());

  // fetchMyAddresses = () => this.fetch({ url: '/get/my-addresses', method: "GET" }).then(res => res.json());

  // fetchBusinessDetails = () => this.fetch({ url: '/get/business-details', method: "GET" }).then(res => res.json());

  // updateContainerData = (...args) => {
  //   !this.state.clients || args.includes("clients") ? this.fetchClients().then(res => this.setState({ clients: res })) : null;
  //   !this.state.myAddresses || args.includes("myAddresses") ? this.fetchMyAddresses().then(res => this.setState({ myAddresses: res })) : null;
  //   !this.state.contactDetails ? this.fetchBusinessDetails().then(res => this.setState({ contactDetails: res.contactDetails })) : null
  // }

  // componentDidMount = () => {
  //   this.updateContainerData();
  // }

  // render() {
  //   const { clients, clientAddresses, myAddresses, contactDetails } = this.state;
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/view-invoice" component={Invoice} />
        <Route>
          <div>
            <Header />
            <div id="container">
              <div className="panel">
                {/* <Route path="/addresses" render={(props) => <Addresses />} />
                <Route path="/clients" render={(props) => <Clients />} /> */}
                <Route exact path="/" render={(props) => <Invoices />} />
              </div>
            </div>
          </div>
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default ViewContainer;