import React, { useState, useEffect } from 'react';
import { NotificationParams } from '../types.js';

function useStatusBar() {

  const [notificationConfig, setNotificationConfig] = useState<NotificationParams>({ message: '', style: '' });
  const { message, style } = notificationConfig;

  useEffect(() => {
    if (message) {
      setTimeout(() => setNotificationConfig({ message: '', style: '' }), 10000);
    }
  }, [message])

  return [notificationConfig, setNotificationConfig] as const;
}

export default useStatusBar;