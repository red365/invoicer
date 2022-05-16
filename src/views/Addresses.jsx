import React from 'react';
import AddressForm from '../components/AddressForm';

const Addresses = props => {
    return (
        <div>
          <div className="panel-title">
            <h3>Addresses</h3>
          </div>
          <AddressForm clients={props.clients} updateContainerData={props.updateContainerData} />
        </div>
    )
}

export default Addresses;