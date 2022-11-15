import React, { FC, ChangeEvent } from 'react';
import { DropdownComponentProps } from '../types.js';

const Dropdown: FC<DropdownComponentProps> = (props) => {
    return (
        <select id={`${props.id}`} name={props.name || ""} className={props.classes} value={props.value || ''} onChange={(e: ChangeEvent<HTMLSelectElement>) => props.changeHandler(e)}>
            <option value="">---</option>
            {props.dropdownItems.map((item: any, i: number) => {
                return <option key={i} value={item.id}>{item[props.propToUseAsItemText]}</option>
            })}
        </select>
    )
}

export default Dropdown;