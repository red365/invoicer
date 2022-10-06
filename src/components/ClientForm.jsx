import React, { useState } from 'react';
import AddressBasedForm from './AddressBasedForm';
import AddressFields from './AddressFields';
import StatusBar from './StatusBar';
import statusBarTransition from '../utils/statusBarTransition';
import useAPI from '../hooks/useAPI';

// updateStatusBarMessage = message => this.setState({ statusMessage: message });

// triggerStatusBarTransition = statusMessage => {
//   const transitionDuration = 5000;
//   statusBarTransition(statusMessage, transitionDuration);
//   // Allow time to fade out before resetting the message
//   setTimeout(() => this.updateStatusBarMessage(''), transitionDuration + 1500);
// }


function ClientForm() {
  function initialiseAddress() {
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

  const { getClients } = useAPI().data;
  const [addAddress, setAddAddress] = useState(false);
  const [address, setAddress] = useState(initialiseAddress());
  const [clientName, setClientName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // function handleResponse(message, getClients, stateUpdateObj) {
  //   setStatusMessage(message);
  //   getClients();
  //   setAddress(initialiseAddress());
  //   setState(stateUpdateObj);
  // }

  function handleCheckboxChange() {
    if (addAddress) {
      setAddress(initialiseAddress());
      setAddAddress(false);
    } else {
      setAddAddress(true);
    }
  }

  function createClient(params) {
    return submitForm({ url: '/create/client', requestBody: { address, clientName } });
  }

  function addressInputHandler(e) {
    address[e.target.name] = e.target.value;
    setAddress(address);
  }

  function handleSubmit() {
    addAddress ? createClient({ address, clientName })
      .then(res => {
        setMessage(message);
        setClientName('');
        setAddress(initialiseAddress());
        setAddress(false);
        getClients();
      })
      .catch(err => updateStatusBarMessage("An error occurred, please try again"))
      : createClient({ clientName })
        .then(res => {
          setMessage(message);
          setClientName('');
          getClients();
        })
        .catch(err => updateStatusBarMessage("An error occurred, please try again"));
  }

  // statusMessage ? this.triggerStatusBarTransition(statusMessage) : null;

  return (
    <form onSubmit={(e) => handleSubmit()}>
      <StatusBar message={statusMessage} />
      <div id="client-input" className="panel-item">
        <label htmlFor="client-name">Name:</label>
        <input id="client-name" type="text" name="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
      </div>
      <div id="include-address-control" className="panel-controls">
        <label htmlFor="include-address">Add an address?</label><br />
        <input id="include-address" type="checkbox" name="random" value={this.state.addAddress} checked={addAddress} onChange={(e) => handleCheckboxChange()} />
      </div>
      <div>
        {addAddress ? <AddressFields
          changeHandler={(e) => addressInputHandler(e)}
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