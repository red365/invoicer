import React, { FC } from 'react';
import { StatusBarComponentProps } from '../types.js';

const StatusBar: FC<StatusBarComponentProps> = (props) => {
  const { message, style } = props.notificationConfig;
  return (
    <div id="status-bar" className={`status-bar ${style ? style + " notification" : "notification"}`}>{message}</div>
  )
}

export default StatusBar;