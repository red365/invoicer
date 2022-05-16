import React from 'react';

const Dropdown = (props) => {
    return (
        <select id={props.id} name={props.name || ""} className={props.classes} value={props.value || ''} onChange={(e) => props.changeHandler(e)}>
            <option value="">---</option>
            { props.dropdownItems.map( (item, i) => {
                return <option key={i} value={item.id}>{item[props.propToUseAsItemText]}</option>
            })}
        </select>
    )
}

export default Dropdown;