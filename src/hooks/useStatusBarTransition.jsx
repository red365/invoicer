import React, { useState } from 'react';
import useStatusBarNotification from './useStatusBarNotification';

const TRANSITION_DURATION = 5000

function useStatusBarTransition() {
    const [message, setStatusMessage] = useStatusBarNotification;
    // Allow time to fade out before resetting the message
    setTimeout(() => setStatusMessage(''), TRANSITION_DURATION + 1500);
}

export default useStatusBarTransition;