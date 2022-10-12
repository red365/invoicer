import React from 'react'

const StatusBar = (props) => {
  const { message, style } = props.notificationConfig;
  return (
    <div id="status-bar" className={`status-bar ${style ? style + " notification" : "notification"}`}>{message}</div>
  )
}

export default StatusBar;