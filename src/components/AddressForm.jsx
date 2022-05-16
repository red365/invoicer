import React from 'react';
import AddressBasedForm from './AddressBasedForm';
import AddressFields from './AddressFields';
import Dropdown from './Dropdown';
import statusBarTransition from '../utils/statusBarTransition';
import StatusBar from '../components/StatusBar';

class AddressForm extends AddressBasedForm {
  state = {
    ...this.state,
    isClientAddress: false,
    selectedClient: undefined,
    statusMessage: ''
  }

  getItemFromList = (value, list) => list.find(item => item.id == value);

  onDropdownValueSelect = (e, clients) => e.target.value ? this.setState({ selectedClient: this.getItemFromList(e.target.value, clients) }) : this.setState({ selectedClient: undefined });

  handleSubmit = (e, isClientAddress, selectedClient, updateContainerData) => {
    e.preventDefault();
    this.submitForm({ url: '/create/address', requestBody: this.state })
    .then(res => {
      this.updateStatusBarMessage(res.message);
      this.initialiseAddress();
      !isClientAddress ? updateContainerData("myAddresses") : null;
      selectedClient ? this.setState({ selectedClient: undefined, isClientAddress: false }) : null;
    }).catch(err => this.updateStatusBarMessage("An error occurred. Please try again"));
  }

  handleRadioSelect = e => e.target.value == "true" ? this.setState({ isClientAddress: true }) : this.setState({ isClientAddress: false });

  updateStatusBarMessage = message => this.setState({ statusMessage: message });

  triggerStatusBarTransition = statusMessage =>  {
    const transitionDuration = 5000;
    statusBarTransition(statusMessage, transitionDuration);
    // Allow time to fade out before resetting the message
    setTimeout(() => this.updateStatusBarMessage(''), transitionDuration + 1500);
  }

  render() {
    const {isClientAddress, selectedClient, statusMessage} = this.state;
    const {clients, updateContainerData} = this.props;

    statusMessage ? this.triggerStatusBarTransition(statusMessage) : null
    return (
        <form className="address-form" onSubmit={(e) => this.handleSubmit(e, isClientAddress, selectedClient, updateContainerData)} >
          <StatusBar message={statusMessage} />
          <div>
            <label>Choose an address type:</label>
            <div>
              <input type="radio" checked={isClientAddress == false} id="business" name="business" value={"false"} onChange={(e) => this.handleRadioSelect(e)} />
              <label htmlFor="business">Business</label>
            </div>
            <div>
              <input type="radio" id="client" checked={isClientAddress == true} name="client" value={"true"} onChange={(e) => this.handleRadioSelect(e)} />
              <label htmlFor="client">Client</label>
            </div>
          </div>
          <div className="panel-controls">
            <div id="client-select">
              { clients && isClientAddress ? <div><label>Client: </label><Dropdown id="client-select" dropdownItems={clients} propToUseAsItemText="name" value={selectedClient ? selectedClient.id : ''} changeHandler={(e) => this.onDropdownValueSelect(e, clients)}/></div>: null }
            </div>
          </div>
          <AddressFields 
            changeHandler={this.textInputHandler} 
            addressLineOne={this.state.addressLineOne}
            addressLineTwo={this.state.addressLineTwo} 
            addressLineThree={this.state.addressLineThree} 
            addressLineFour={this.state.addressLineFour} 
            city={this.state.city}
            countyOrState={this.state.countyOrState}
            postOrZipCode={this.state.postOrZipCode}
          />
          <div className="button-container">
            <button type="submit" className="btn btn-primary">Save</button>
          </div>
        </form>
    )
  }
}

export default AddressForm;