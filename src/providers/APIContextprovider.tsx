import React, { useState, useEffect, createContext, FC } from 'react';
import { APIData, Client, MyAddress, ContactDetails } from '../types.js';

interface IContextProps {
  data: APIData;
  getClients: () => void;
  getMyAddresses: () => void;
  getBusinessDetails: () => void;
}

interface Props {
  children: JSX.Element;
}

type FetchCallback = (res: any) => void;

export const APIContext = createContext({} as IContextProps);

const APIContextProvider: FC<Props> = ({ children }) => {
  const [data, setData] = useState({} as APIData);

  const fetchAPIData = (url: string, callback: FetchCallback) => fetch(url).then(res => res.json()).then(res => callback(res));
  const getClients = () => fetchAPIData("/get/clients", (res: Client[]) => setData((prevState => ({ ...prevState, clients: res }))));
  const getMyAddresses = () => fetchAPIData("/get/my-addresses", (res: MyAddress[]) => setData((prevState => ({ ...prevState, myAddresses: res }))));
  const getBusinessDetails = () => fetchAPIData("/get/business-details", (res: ContactDetails) => setData((prevState => ({ ...prevState, contactDetails: res }))));

  const getAPIData = () => {
    getClients();
    getMyAddresses();
    getBusinessDetails();
  }

  useEffect(() => getAPIData(), [])

  return <APIContext.Provider value={{ data, getClients, getMyAddresses, getBusinessDetails }} >{children}</APIContext.Provider>
}

export default APIContextProvider;