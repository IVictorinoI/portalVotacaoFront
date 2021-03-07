import React from 'react'
import { Link } from 'react-router'
import If from '../operator/if' 

export default props => (
    <li> 
        <Link to={props.path}>
            <i className={`fa fa-${props.icon}`}></i> 
            <span>{props.label}</span>
            <If test={props.notifyCount}>
                <span className="pull-right-container">
                    <small className="label pull-right bg-red">{props.notifyCount}</small>
                </span>
            </If>
        </Link>
    </li>
)