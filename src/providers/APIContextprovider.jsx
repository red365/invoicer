import React, { useState, useEffect, createContext } from 'react';

export const APIContext = createContext();

const APIContextProvider = ({ children }) => {
  const [data, setData] = useState({});

  const updateApiData = (dataType, dataToStore) => {
    data[dataType] = dataToStore[dataType];

    setData({ ...data });
  }

  const fetchAPIData = (url, callback) => fetch(url).then(res => res.json()).then(res => callback(res));
  const getClients = () => fetchAPIData("/get/clients", (res) => updateApiData("clients", { clients: res }));
  const getMyAddresses = () => fetchAPIData("/get/my-addresses", (res) => updateApiData("myAddresses", { myAddresses: res }));
  const getBusinessDetails = () => fetchAPIData("/get/business-details", (res) => updateApiData("contactDetails", { contactDetails: res }));

  const getAPIData = () => {
    getClients();
    getMyAddresses();
    getBusinessDetails();
  }

  useEffect(() => getAPIData(), [])

  return <APIContext.Provider value={{ data, getClients, getMyAddresses, getBusinessDetails }} >{children}</APIContext.Provider>
}

export default APIContextProvider;