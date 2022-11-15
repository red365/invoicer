import React, { FC, ChangeEvent } from 'react';
import { AddressFieldsComponentProps } from '../types';

const AddressFields: FC<AddressFieldsComponentProps> = (props) => {

  return (
    <div id="address-fields">
      <div className="form-field">
        <label htmlFor="address-line-one">Address Line One:</label>
        <input id="address-line-one" name="addressLineOne" value={props.addressLineOne} onChange={(e: ChangeEvent<HTMLInputElement>) => props.changeHandler(e)} type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="address-line-two">Address Line Two:</label>
        <input id="address-line-two" name="addressLineTwo" value={props.addressLineTwo} onChange={(e: ChangeEvent<HTMLInputElement>) => props.changeHandler(e)} type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="address-line-three">Address Line Three:</label>
        <input id="address-line-three" name="addressLineThree" value={props.addressLineThree} onChange={(e: ChangeEvent<HTMLInputElement>) => props.changeHandler(e)} type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="address-line-four">Address Line Four:</label>
        <input id="address-line-four" name="addressLineFour" value={props.addressLineFour} onChange={(e: ChangeEvent<HTMLInputElement>) => props.changeHandler(e)} type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="city">City:</label>
        <input id="city" name="city" value={props.city} onChange={(e: ChangeEvent<HTMLInputElement>) => props.changeHandler(e)} type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="county-or-state">County/State:</label>
        <input id="county-or-state" name="countyOrState" value={props.countyOrState} onChange={(e: ChangeEvent<HTMLInputElement>) => props.changeHandler(e)} type="text" />
      </div>
      <div className="form-field">
        <label htmlFor="post-or-zip-code">Post or Zip Code:</label>
        <input id="post-or-zip-code" name="postOrZipCode" value={props.postOrZipCode} onChange={(e: ChangeEvent<HTMLInputElement>) => props.changeHandler(e)} type="text" />
      </div>
    </div>
  )
}

export default AddressFields;