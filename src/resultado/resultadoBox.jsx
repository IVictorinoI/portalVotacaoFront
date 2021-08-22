import React from 'react'
import If from '../common/operator/if'

export default props => (
    <div className={props.yellow ? "small-box bg-yellow" : "small-box bg-gray-ligh"}>
        <div className="inner">
        <h3>
            {props.value}
            <If test={props.perc}>
                <sup style={({fontSize: "20px"})}>%</sup>
            </If>
        </h3>
        <p><h3>{props.text}</h3></p>
        </div>
        <div className="icon">  
        <i className="ion ion-stats-bars"></i>
        </div>
    </div>
)