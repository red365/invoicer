import React, { useState, useEffect } from 'react';

function useStatusBar() {

  const [notificationConfig, setNotificationConfig] = useState({ message: '', style: '' });
  const { message, style } = notificationConfig;

  useEffect(() => {
    if (message) {
      console.log("Setting timeout")
      setTimeout(() => setNotificationConfig({ message: '', style: '' }), 10000);
    }
  }, [message])

  return [notificationConfig, setNotificationConfig];
}

export default useStatusBar;