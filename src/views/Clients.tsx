import React, { FC } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ClientForm from '../components/ClientForm';

const Clients: FC<RouteComponentProps> = (props) => {
  return (
    <div>
      <div className="panel-title">
        <h3>Add a new Client</h3>
      </div>
      <ClientForm />
    </div>
  )
}

export default withRouter(Clients);