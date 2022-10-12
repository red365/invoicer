import React, { useState } from 'react';
import AddressFields from './AddressFields';
import Dropdown from './Dropdown';
import StatusBar from '../components/StatusBar';
import useAPI from '../hooks/useAPI';
import useStatusBar from '../hooks/useStatusBar';

function AddressForm(props) {

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

  const [address, setAddress] = useState(initialiseAddress());
  const [isClientAddress, setIsClientAddress] = useState(false);
  const [selectedClient, setSelectedClient] = useState(undefined);
  const [notificationConfig, setNotificationConfig] = useStatusBar();

  function addressInputHandler(e) {
    address[e.target.name] = e.target.value;
    setAddress(address);
  }

  function handleAnyErrors(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw Error(response.statusText);
    }
  }

  function addressInputHandler(e) {
    const addressParam = { [e.target.name]: e.target.value };
    setAddress(prev => {
      return { ...prev, ...addressParam }
    });
  }

  function onDropdownValueSelect(e, clients) {
    e.target.value ? setSelectedClient(getItemFromList(e.target.value, clients)) : setSelectedClient(undefined);
  }

  function getItemFromList(value, list) {
    return list.find(item => item.id == value);
  }

  function handleRadioSelect(e) {
    e.target.value == "true" ? setIsClientAddress(true) : setIsClientAddress(false);
  }

  function submitForm(opts) {
    return fetch(opts.url, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(opts.requestBody) }).then(res => handleAnyErrors(res));
  }

  function handleSubmit(e) {
    e.preventDefault();
    submitForm({ url: '/create/address', requestBody: { address, isClientAddress, selectedClient } })
      .then(res => {
        setNotificationConfig({ message: res.message, style: "success" });
        setAddress(initialiseAddress());
        !isClientAddress ? getMyAddresses() : null;
        if (selectedClient) {
          setSelectedClient(undefined);
          setIsClientAddress(false);
        }
      }).catch(err => {
        setNotificationConfig({ message: "An error occurred, please try again", style: "error" })
      });
  }

  return (
    <form className="address-form" onSubmit={(e) => handleSubmit(e)} >
      <StatusBar notificationConfig={notificationConfig} />
      <div>
        <label>Choose an address type:</label>
        <div>
          <input type="radio" checked={isClientAddress == false} id="business" name="business" value={"false"} onChange={(e) => handleRadioSelect(e)} />
          <label htmlFor="business">Business</label>
        </div>
        <div>
          <input type="radio" id="client" checked={isClientAddress == true} name="client" value={"true"} onChange={(e) => handleRadioSelect(e)} />
          <label htmlFor="client">Client</label>
        </div>
      </div>
      <div className="panel-controls">
        <div id="client-select">
          {clients && isClientAddress ? <div><label>Client: </label><Dropdown id="client-select" dropdownItems={clients} propToUseAsItemText="name" value={selectedClient ? selectedClient.id : ''} changeHandler={(e) => onDropdownValueSelect(e, clients)} /></div> : null}
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