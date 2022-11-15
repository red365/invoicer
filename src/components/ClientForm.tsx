import React, { useState, FC, FormEvent, ChangeEvent } from 'react';
import { Address, FetchOpts, CreateClientFetchOpts, CreateClientFetchOptsBody } from '../types';
import AddressFields from './AddressFields';
import StatusBar from './StatusBar';
import useStatusBar from '../hooks/useStatusBar';
import useAPI from '../hooks/useAPI';

const ClientForm: FC = () => {
  const initialiseAddress = (): Address => {
    return {
      addressLineOne: '',
      addressLineTwo: '',
      addressLineThree: '',
      addressLineFour: '',
      city: '',
      countyOrState: '',
      postOrZipCode: ''
    };
  }

  const { getClients } = useAPI();
  const [addAddress, setAddAddress] = useState(false);
  const [address, setAddress] = useState(initialiseAddress());
  const [clientName, setClientName] = useState('');
  const [notificationConfig, setNotificationConfig] = useStatusBar();

  const handleCheckboxChange = (): void => {
    if (addAddress) {
      setAddress(initialiseAddress());
      setAddAddress(false);
    } else {
      setAddAddress(true);
    }
  }

  const handleAnyErrors = (response: any): any | void => {
    if (response.ok) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  }

  function submitForm(opts: CreateClientFetchOpts) {
    return fetch(opts.url, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(opts.body) })
      .then((res: any) => handleAnyErrors(res));
  }

  function createClient(params: CreateClientFetchOptsBody) {
    return submitForm({ url: '/create/client', body: params });
  }

  const addressInputHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const addressParam = { [e.target.name]: e.target.value };
    setAddress(prev => {
      return { ...prev, ...addressParam }
    });
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    addAddress ? createClient({ address, clientName, addAddress })
      .then(res => {
        setNotificationConfig({ message: res.message, style: "success" });
        setClientName('');
        setAddress(initialiseAddress());
        setAddAddress(false);
        getClients();
      })
      .catch(err => {
        setNotificationConfig({ message: "An error occurred, please try again", style: "error" })
      })
      : createClient({ clientName, addAddress })
        .then(res => {
          setNotificationConfig({ message: res.message, style: "success" });
          setClientName('');
          getClients();
        })
        .catch(err => {
          setNotificationConfig({ message: "An error occurred, please try again", style: "error" })
        });
  }

  return (
    <form onSubmit={(e: FormEvent<HTMLFormElement>) => handleSubmit(e)}>
      <StatusBar notificationConfig={notificationConfig} />
      <div id="client-input" className="panel-item">
        <label htmlFor="client-name">Name:</label>
        <input id="client-name" type="text" name="clientName" value={clientName} onChange={(e: ChangeEvent<HTMLInputElement>) => setClientName(e.target.value)} />
      </div>
      <div id="include-address-control" className="panel-controls">
        <label htmlFor="include-address">Add an address?</label><br />
        <input id="include-address" type="checkbox" name="random" checked={addAddress} onChange={(e: ChangeEvent<HTMLInputElement>) => handleCheckboxChange()} />
      </div>
      <div>
        {addAddress ? <AddressFields
          changeHandler={(e: ChangeEvent<HTMLInputElement>) => addressInputHandler(e)}
          addressLineOne={address.addressLineOne}
          addressLineTwo={address.addressLineTwo}
          addressLineThree={address.addressLineThree}
          addressLineFour={address.addressLineFour}
          city={address.city}
          countyOrState={address.countyOrState}
          postOrZipCode={address.postOrZipCode}
        /> : null}
      </div>
      <div className="button-container">
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}

export default ClientForm;