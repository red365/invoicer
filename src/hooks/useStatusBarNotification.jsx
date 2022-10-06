import React, { useState } from 'react';

function useStatusBarNotification(message = undefined) {
    const [statusMessage, setStatusMessage] = useState('');

    if (message == undefined) {
        return message;
    }

    setStatusMessage(message);
    return statusMessage;
}

export default useStatusBarNotification;