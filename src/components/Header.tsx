import React, { FC } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { LocationDescriptorObject } from 'history';

const Header: FC<RouteComponentProps> = ({ history }) => {
  const handleClick = ({ pathname, state }: LocationDescriptorObject): void => {
    history.push({ pathname, state });
  }

  return (
    <div id="header">
      <div className="logo-container">
        <h3 id="logo">Invoicer</h3>
        <p className="logo-text"><strong>[ Insert Cool Logo Here ]</strong></p>
      </div>
      <div id="header-links">
        <ul id="header-list">
          <li onClick={() => handleClick({ pathname: '/', state: {} })}>Invoices</li>
          <li onClick={() => handleClick({ pathname: '/clients', state: {} })}>Clients</li>
          <li onClick={() => handleClick({ pathname: '/addresses', state: {} })}>Addresses</li>
        </ul>
      </div>
    </div>
  )
}

export default withRouter(Header);