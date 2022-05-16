import React from 'react';
import AddressBasedForm from './AddressBasedForm';
import AddressFields from './AddressFields';
import StatusBar from './StatusBar';
import statusBarTransition from '../utils/statusBarTransition';

class ClientForm extends AddressBasedForm {

  state = {
    ...this.state,
    clientName: '',
    addAddress: false,
    statusMessage: ''
  }

  updateStatusBarMessage = message => this.setState({ statusMessage: message });

  triggerStatusBarTransition = statusMessage => {
    const transitionDuration = 5000;
    statusBarTransition(statusMessage, transitionDuration);
    // Allow time to fade out before resetting the message
    setTimeout(() => this.updateStatusBarMessage(''), transitionDuration + 1500);
  }

  createClient = (requestBody) => this.submitForm({ url: '/create/client', requestBody });

  handleSubmit = (state, updateContainerData) => {
    const { clientName, addAddress } = state;

    addAddress ? this.createClient({ ...state })
                  .then(res => this.handleResponse(res.message, updateContainerData, { clientName: '', addAddress: false }))
                  .catch(err => this.updateStatusBarMessage("An error occurred, please try again"))
                : this.createClient({ clientName })
                  .then(res => this.handleResponse(res.message, updateContainerData, { clientName: '' }))
                  .catch(err => this.updateStatusBarMessage("An error occurred, please try again"));
  }

  handleResponse = (message, updateContainerData, stateUpdateObj) => {
    this.updateStatusBarMessage(message);
    updateContainerData("clients");
    this.initialiseAddress();
    this.setState(stateUpdateObj);
  }

  handleCheckboxChange = e => {
    if (this.state.addAddress) {
      this.initialiseAddress();
      this.setState({ addAddress: false });
    } else {
      this.setState({ addAddress: true });
    }
  }


  render() {
    this.state.statusMessage ? this.triggerStatusBarTransition(this.state.statusMessage) : null;
    return (
      <div>
        <StatusBar message={this.state.statusMessage} />
        <div id="client-input" className="panel-item">
          <label htmlFor="client-name">Name:</label>
          <input id="client-name" type="text" name="clientName" value={this.state.clientName} onChange={(e) => this.textInputHandler(e)} />
        </div>
        <div id="include-address-control" className="panel-controls">
          <label htmlFor="include-address">Add an address?</label><br />
          <input id="include-address" type="checkbox" name="random" value={this.state.addAddress} checked={this.state.addAddress} onChange={(e) => this.handleCheckboxChange(e)} />
        </div>
        <div>
          {this.state.addAddress ? <AddressFields changeHandler={(e) => this.textInputHandler(e)} /> : null}
        </div>
        <div className="button-container">
          <button type="submit" className="btn btn-primary" onClick={(e) => this.handleSubmit(this.state, this.props.updateContainerData)}>Save</button>
        </div>
      </div>
    )
  }
}

export default ClientForm;