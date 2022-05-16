import React, { Component } from 'react';

class AddressBasedForm extends Component {
    state = {
      addressLineOne: '',
      addressLineTwo: '',
      addressLineThree: '',
      addressLineFour: '',
      city: '',
      countyOrState: '',
      postOrZipCode: ''
    }

    handleErrors = response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    } 

    submitForm = opts => fetch(opts.url, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(opts.requestBody)})
    .then(res => this.handleErrors(res));

    initialiseAddress = () => {
      this.setState({
        addressLineOne: '',
        addressLineTwo: '',
        addressLineThree: '',
        addressLineFour: '',
        city: '',
        countyOrState: '',
        postOrZipCode: ''
      });
    }

    textInputHandler = e => this.setState({ [e.target.name]: e.target.value })

    render() {
      return null
    }
}

export default AddressBasedForm