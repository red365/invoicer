import React from 'react';
import ClientForm from '../components/ClientForm';

const Clients = props => {
  return (
    <div>
      <div className="panel-title">
        <h3>Add a new Client</h3>
      </div>
      <ClientForm />
    </div>
  )
}

export default Clients;