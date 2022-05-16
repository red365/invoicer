import React from 'react'

const StatusBar = (props) => {
  return (
    <div id="status-bar" className="status-bar">{props.message}</div>
  )
}

export default StatusBar;