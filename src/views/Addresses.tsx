import React, { FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import AddressForm from '../components/AddressForm';

const Addresses: FC<RouteComponentProps> = props => {
  return (
    <div>
      <div className="panel-title">
        <h3>Addresses</h3>
      </div>
      <AddressForm />
    </div>
  )
}

export default withRouter(Addresses as any);