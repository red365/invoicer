import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Clients from './Clients';
import Invoices from './Invoices';
import Invoice from './Invoice';
import Addresses from './Addresses';
import Header from '../components/Header';

function ViewContainer(props) {

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/view-invoice" component={Invoice} />
        <Route>
          <div>
            <Header />
            <div id="container">
              <div className="panel">
                <Route path="/addresses" render={(props) => <Addresses />} />
                <Route path="/clients" render={(props) => <Clients />} />
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