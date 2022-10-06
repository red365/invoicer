import React from 'react';
import AddressBasedForm from './AddressBasedForm';
import AddressFields from './AddressFields';
import Dropdown from './Dropdown';
import statusBarTransition from '../utils/statusBarTransition';
import StatusBar from '../components/StatusBar';
import useAPI from '../hooks/useAPI';
import useStatusBarNotification from '../hooks/useStatusBarNotification';

// triggerStatusBarTransition = statusMessage => {}

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

  const { getMyAddresses, clients } = useAPI().data;

  const [address, setAddress] = useState(initialiseAddress());
  const [statusMessage, setStatusMessage] = useState('');
  const [isClientAddress, setIsClientAddress] = useState(false);
  const [selectedClient, setSelectedClient] = useState(undefined);



  function addressInputHandler(e) {
    address[e.target.name] = e.target.value;
    setAddress(address);
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
    return fetch(opts.url, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(opts.requestBody) }).then(res => handleErrors(res));
  }

  function handleSubmit() {
    e.preventDefault();
    submitForm({ url: '/create/address', requestBody: { address, isClientAddress, selectedClient } })
      .then(res => {
        setStatusMessage(res.message);
        initialiseAddress();
        !isClientAddress ? getMyAddresses() : null;
        if (selectedClient) {
          setSelectedClient(undefined);
          isClientAddress(false);
        }
      }).catch(err => setStatusMessage("An error occurred. Please try again"));
  }

  // useStatusBarNotification() ? useStatusBarTransition() : null;
  return (
    <form className="address-form" onSubmit={(e) => handleSubmit()} >
      <StatusBar message={statusMessage} />
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