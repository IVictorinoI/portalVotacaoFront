import React from 'react'
import Grid from '../layout/grid'

export default props => (
    <Grid cols={props.cols}> 
        <div className={`small-box bg-${props.color}`}> 
            <div className='inner'> 
                <h4>{props.valorEsperado}</h4>
                <h4>{props.valorConfirmado}</h4>
                <h4>{props.percentual}</h4>
                <p>{props.text}</p>
            </div> 
            <div className='icon'> 
                <i className={`fa fa-${props.icon}`}></i>
            </div> 
        </div> 
    </Grid> 
)