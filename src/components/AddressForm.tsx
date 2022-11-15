import React, { useState, FC, FormEvent, ChangeEvent } from 'react';
import {
  Address, Client, CreateAddressFetchOpts
} from '../types';
import AddressFields from './AddressFields';
import Dropdown from './Dropdown';
import StatusBar from '../components/StatusBar';
import useAPI from '../hooks/useAPI';
import useStatusBar from '../hooks/useStatusBar';

const AddressForm: FC = () => {

  function initialiseAddress() {
    return {
      addressLineOne: '',
      addressLineTwo: '',
      addressLineThree: '',
      addressLineFour: '',
      city: '',
      countyOrState: '',
      postOrZipCode: ''
    }
  }

  const { getMyAddresses } = useAPI();
  const { clients } = useAPI().data;

  const [address, setAddress] = useState<Address>(initialiseAddress());
  const [isClientAddress, setIsClientAddress] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [notificationConfig, setNotificationConfig] = useStatusBar();

  const addressInputHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target
    setAddress(prevState => ({ ...prevState, [name]: value }));
  }

  const handleAnyErrors = (response: any): void => {
    if (response.ok) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  }

  const onDropdownValueSelect = (e: ChangeEvent<HTMLSelectElement>, clients: Client[]): void => {
    e.target.value ? setSelectedClient(getItemFromList(e.target.value, clients)) : setSelectedClient(undefined);
  }

  const getItemFromList = (value: string | number, list: Client[]): Client | undefined => {
    return list.find(item => item.id == value);
  }

  const handleRadioSelect = (e: ChangeEvent<HTMLInputElement>): any => {
    e.target.value == "true" ? setIsClientAddress(true) : setIsClientAddress(false);
  }

  const submitForm = (opts: CreateAddressFetchOpts): any => {
    return fetch(opts.url, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(opts.body) }).then(res => handleAnyErrors(res));
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    submitForm({ url: '/create/address', body: { address, isClientAddress, selectedClient } })
      .then((res: any) => {
        setNotificationConfig({ message: res.message, style: "success" });
        setAddress(initialiseAddress());
        !isClientAddress ? getMyAddresses() : null;
        if (selectedClient) {
          setSelectedClient(undefined);
          setIsClientAddress(false);
        }
      }).catch((err: any) => {
        setNotificationConfig({ message: "An error occurred, please try again", style: "error" })
      });
  }

  const selectedClientId = selectedClient && selectedClient.id ? selectedClient.id : '';

  return (
    <form className="address-form" onSubmit={(e) => handleSubmit(e)} >
      <StatusBar notificationConfig={notificationConfig} />
      <div>
        <label>Choose an address type:</label>
        <div>
          <input type="radio" checked={isClientAddress == false} id="business" name="business" value={"false"} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRadioSelect(e)} />
          <label htmlFor="business">Business</label>
        </div>
        <div>
          <input type="radio" id="client" checked={isClientAddress == true} name="client" value={"true"} onChange={(e: ChangeEvent<HTMLInputElement>) => handleRadioSelect(e)} />
          <label htmlFor="client">Client</label>
        </div>
      </div>
      <div className="panel-controls">
        <div id="client-select">
          {clients && isClientAddress ? <div><label>Client: </label><Dropdown id="client-select" dropdownItems={clients} propToUseAsItemText="name" value={selectedClientId} changeHandler={(e: ChangeEvent<HTMLSelectElement>) => onDropdownValueSelect(e, clients)} /></div> : null}
        </div>
      </div>
      <AddressFields
        changeHandler={addressInputHandler}
        addressLineOne={address.addressLineOne}
        addressLineTwo={address.addressLineTwo}
        addressLineThree={address.addressLineThree}
        addressLineFour={address.addressLineFour}
        city={address.city}
        countyOrState={address.countyOrState}
        postOrZipCode={address.postOrZipCode}
      />
      <div className="button-container">
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}

export default AddressForm;